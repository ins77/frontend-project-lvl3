import _ from 'lodash';
import axios from 'axios';
import validator from 'validator';
import formRssErrors from './constants/formRssErrors';
import formRssStatuses from './constants/formRssStatuses';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const queryInterval = 5000;

const parseFeed = (data, feedLink) => {
  const domParser = new DOMParser();
  const rssDocument = domParser.parseFromString(data, 'application/xml');

  if (rssDocument.querySelector('parsererror')) {
    throw new Error('parserError');
  }

  const articles = rssDocument.querySelectorAll('item');
  const mappedArticles = [...articles].map((item) => (
    {
      link: item.querySelector('link').textContent,
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
    }
  ));

  return {
    link: feedLink,
    title: rssDocument.querySelector('title').textContent,
    description: rssDocument.querySelector('description').textContent,
    articles: mappedArticles,
  };
};

const updateState = (state, feed, feedLink) => {
  const isFeedExisting = state.feeds.some((feedItem) => feedItem.link === feedLink);

  if (!isFeedExisting) {
    state.feeds = [...state.feeds, feed];
    state.allArticles = [...feed.articles, ...state.allArticles];

    return;
  }

  const feedToUpdate = state.feeds.find((feedItem) => feedItem.link === feedLink);
  const [latestArticle] = _.differenceWith(feed.articles, feedToUpdate.articles, _.isEqual);
  const isArticleExisting = latestArticle
    && state.allArticles.some((article) => article.link === latestArticle.link);
  const isNewArticlesAdded = latestArticle && !isArticleExisting;

  if (isNewArticlesAdded) {
    state.allArticles = [latestArticle, ...state.allArticles];
  }
};

const getQueryErrorMessage = (error) => {
  const errorMessage = error.toString();

  if (errorMessage === 'Error: parserError') {
    return formRssErrors.parserError;
  }

  if (errorMessage === 'Error: Request failed with status code 404') {
    return formRssErrors.notFound;
  }

  return formRssErrors.unknown;
};

const getInputErrorMessage = (isURL, isFeedExisting) => {
  if (!isURL) return formRssErrors.notURL;
  if (isFeedExisting) return formRssErrors.existingFeed;
  return formRssErrors.noError;
};

const getFeed = (state, feedLink, interval = queryInterval) => (
  axios.get(`${corsProxy}${feedLink}`)
    .then(({ data }) => {
      const feed = parseFeed(data, feedLink);

      updateState(state, feed, feedLink);
    })
    .then(() => {
      setTimeout(() => {
        getFeed(state, feedLink);
      }, interval);
    })
);

export const onInputWebInput = (state) => (event) => {
  const inputValue = event.target.value;
  const isFeedExisting = state.feeds.some((feed) => feed.link === inputValue);
  const isURL = validator.isURL(inputValue);
  const isRssValid = isURL && !isFeedExisting;

  state.errorMessage = getInputErrorMessage(isURL, isFeedExisting);
  state.formRssStatus = isRssValid ? formRssStatuses.valid : formRssStatuses.invalid;
};

export const onFormRssSubmit = (state) => (event) => {
  event.preventDefault();

  const { target } = event;

  state.formRssStatus = formRssStatuses.load;

  getFeed(state, target.inputWeb.value)
    .then(() => {
      state.formRssStatus = formRssStatuses.clear;
    })
    .catch((error) => {
      state.formRssStatus = formRssStatuses.invalid;
      state.errorMessage = getQueryErrorMessage(error);
    });
};

export const onArticlesListClick = (state) => (event) => {
  const { target } = event;

  if (!target.dataset.toggle) return;

  state.modal = state.allArticles.find((item) => item.link === target.href);
};
