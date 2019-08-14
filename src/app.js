import axios from 'axios';
import { watch } from 'melanke-watchjs';
import validator from 'validator';

const corsLink = 'https://cors-anywhere.herokuapp.com/';

export default () => {
  const state = {
    formRSS: {
      valid: true,
      submitDisabled: true,
    },
    addedFeeds: [],
  };

  const domParser = new DOMParser();
  const inputWeb = document.querySelector('#input-web');
  const buttonSubmit = document.querySelector('#button-submit');
  const formRss = document.querySelector('#form-rss');
  const feedsList = document.querySelector('#feeds');
  const newsList = document.querySelector('#news');

  const getFeed = (link) => (
    axios.get(`${corsLink}${link}`)
      .then(({ data }) => domParser.parseFromString(data, 'application/xml'))
      .then((doc) => {
        const items = doc.querySelectorAll('item');
        const mappedItems = [...items].map((item) => (
          {
            link: item.querySelector('link').textContent,
            title: item.querySelector('title').textContent,
          }
        ));

        return {
          link,
          title: doc.querySelector('title').textContent,
          description: doc.querySelector('description').textContent,
          items: mappedItems,
        };
      })
      .then((feed) => {
        state.addedFeeds = [...state.addedFeeds, feed];
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

  watch(state, 'addedFeeds', () => {
    inputWeb.value = '';
    inputWeb.classList.remove('is-valid');

    const feeds = state.addedFeeds.map((feed) => (
      `<li class="list-group-item">
        <h6>${feed.title}</h6>
        ${feed.description}
      </li>`
    ));

    feedsList.innerHTML = feeds.join('');

    const news = state.addedFeeds.reduce((acc, { items }) => [...acc, ...items], []);
    const mappedNews = news.map(({ title }) => (
      `<div class="col-sm-6 mb-3">
        <div class="card">
          <div class="card-body">
            <a href="#" class="card-link">${title}</a>
          </div>
        </div>
      </div>`
    ));

    newsList.innerHTML = mappedNews.join('');
  });

  inputWeb.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    const isFeedExisting = state.addedFeeds.some((feed) => feed.link === inputValue);

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
};
