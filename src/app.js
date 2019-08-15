// TODO: обработка ошибок
// TODO: перевести в конечные автоматы
// TODO: разнести по модулям

import _ from 'lodash';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import validator from 'validator';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';

export default () => {
  const state = {
    formRSS: {
      valid: true,
      submitDisabled: true,
    },
    feeds: [],
    allNews: [],
    modal: {
      title: '',
      description: '',
    },
  };

  const domParser = new DOMParser();
  const inputWeb = document.querySelector('#inputWeb');
  const buttonSubmit = document.querySelector('#buttonSubmit');
  const formRss = document.querySelector('#formRss');
  const feedsList = document.querySelector('#feeds');
  const newsList = document.querySelector('#news');
  const newsModalTitle = document.querySelector('#newsModalTitle');
  const newsModalBody = document.querySelector('#newsModalBody');

  const getFeed = (feedLink) => (
    axios.get(`${corsProxy}${feedLink}`)
      .then(({ data }) => domParser.parseFromString(data, 'application/xml'))
      .then((doc) => {
        const items = doc.querySelectorAll('item');
        const mappedItems = [...items].map((item) => (
          {
            feedLink,
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
          state.allNews = [...feed.items, ...state.allNews];
        } else {
          const feedToUpdate = state.feeds.find((feedItem) => feedItem.link === feedLink);
          const [latestNews] = _.differenceWith(feed.items, feedToUpdate.items, _.isEqual);
          const isNewsExisting = latestNews && state.allNews.some((newsItem) => newsItem.link === latestNews.link);

          if (latestNews && !isNewsExisting) {
            state.allNews = [latestNews, ...state.allNews];
          }
        }

        setTimeout(() => {
          getFeed(feedLink);
        }, 5000);
      })
  );

  watch(state, 'formRSS', () => {
    buttonSubmit.disabled = state.formRSS.submitDisabled;

    if (state.formRSS.valid) {
      inputWeb.classList.remove('is-invalid');
      inputWeb.classList.add('is-valid');
    } else {
      inputWeb.classList.remove('is-valid');
      inputWeb.classList.add('is-invalid');
    }
  });

  watch(state, 'feeds', () => {
    inputWeb.value = '';
    inputWeb.classList.remove('is-valid');

    const feeds = state.feeds.map((feed) => (
      `<li class="list-group-item">
        <h6>${feed.title}</h6>
        ${feed.description}
      </li>`
    ));

    feedsList.innerHTML = feeds.join('');
  });

  watch(state, 'allNews', () => {
    const news = state.allNews.map(({ title, link }) => (
      `<div class="col-sm-6 mb-3">
        <div class="card">
          <div class="card-body">
            <a href=${link} class="card-link" data-toggle="modal" data-target="#newsModal">${title}</a>
          </div>
        </div>
      </div>`
    ));

    newsList.innerHTML = news.join('');
  });

  watch(state, 'modal', () => {
    newsModalTitle.textContent = state.modal.title;
    newsModalBody.textContent = state.modal.description;
  });

  inputWeb.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    const isFeedExisting = state.feeds.some((feed) => feed.link === inputValue);

    if (!validator.isURL(inputValue) || isFeedExisting) {
      state.formRSS.valid = false;
      state.formRSS.submitDisabled = true;
    } else {
      state.formRSS.valid = true;
      state.formRSS.submitDisabled = false;
    }
  });

  formRss.addEventListener('submit', (event) => {
    event.preventDefault();

    state.formRSS.submitDisabled = true;

    getFeed(inputWeb.value);
  });

  newsList.addEventListener('click', (event) => {
    const { target } = event;

    if (!target.dataset.toggle) return;

    const newsItem = state.news.find((item) => item.link === target.href);

    state.modal.title = newsItem.title;
    state.modal.description = newsItem.description;
  });
};
