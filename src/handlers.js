import _ from 'lodash';
import axios from 'axios';
import validator from 'validator';
import formRssErrors from './constants/formRssErrors';
import formRssStatuses from './constants/formRssStatuses';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const queryInterval = 5000;
const domParser = new DOMParser();
const inputWeb = document.querySelector('#inputWeb');

const getFeed = (state, feedLink, interval = queryInterval) => (
  axios.get(`${corsProxy}${feedLink}`)
    .then(({ data }) => domParser.parseFromString(data, 'application/xml'))
    .then((doc) => {
      if (doc.querySelector('parsererror')) {
        throw new Error('parserError');
      }

      const items = doc.querySelectorAll('item');
      const mappedItems = [...items].map((item) => (
        {
          link: item.querySelector('link').textContent,
          title: item.querySelector('title').textContent,
          description: item.querySelector('description').textContent,
        }
      ));

      return {
        link: feedLink,
        title: doc.querySelector('title').textContent,
        description: doc.querySelector('description').textContent,
        items: mappedItems,
      };
    })
    .then((feed) => {
      const isFeedExisting = state.feeds.some((feedItem) => feedItem.link === feedLink);

      if (!isFeedExisting) {
        state.feeds = [...state.feeds, feed];
        state.allArticles = [...feed.items, ...state.allArticles];
      } else {
        const feedToUpdate = state.feeds.find((feedItem) => feedItem.link === feedLink);
        const [latestArticle] = _.differenceWith(feed.items, feedToUpdate.items, _.isEqual);
        const isArticleExisting = latestArticle
          && state.allArticles.some((article) => article.link === latestArticle.link);
        const isNewArticlesAdded = latestArticle && !isArticleExisting;

        if (isNewArticlesAdded) {
          state.allArticles = [latestArticle, ...state.allArticles];
        }
      }

      setTimeout(() => {
        getFeed(state, feedLink);
      }, interval);
    })
    .catch((error) => {
      const errorMessage = error.toString();

      state.formRssStatus = formRssStatuses.invalid;

      if (errorMessage === 'Error: parserError') {
        state.errorMessage = formRssErrors.notRSS;
      } else if (errorMessage === 'Error: Request failed with status code 404') {
        state.errorMessage = formRssErrors.notFound;
      } else {
        state.errorMessage = formRssErrors.unknown;
      }

      return error;
    })
);

export const onInputWebInput = (state) => (event) => {
  const inputValue = event.target.value;
  const isFeedExisting = state.feeds.some((feed) => feed.link === inputValue);
  const isURL = validator.isURL(inputValue);
  const isRssValid = isURL && !isFeedExisting;
  const getErrorMessage = () => {
    if (!isURL) return formRssErrors.notURL;
    if (isFeedExisting) return formRssErrors.existingFeed;
    return formRssErrors.noError;
  };

  state.errorMessage = getErrorMessage();
  state.formRssStatus = isRssValid ? formRssStatuses.valid : formRssStatuses.invalid;
};

export const onFormRssSubmit = (state) => (event) => {
  event.preventDefault();

  state.formRssStatus = formRssStatuses.load;

  getFeed(state, inputWeb.value)
    .then((error) => {
      if (!error) {
        state.formRssStatus = formRssStatuses.clear;
      }
    });
};

export const onArticlesListClick = (state) => (event) => {
  const { target } = event;

  if (!target.dataset.toggle) return;

  state.modal = state.allArticles.find((item) => item.link === target.href);
};
