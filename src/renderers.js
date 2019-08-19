
import formRssStatuses from './constants/formRssStatuses';
import { errorMessagesRU, errorMessagesEN } from './constants/rssErrorMessages';
import initi18next from './utils';

export const renderErrorMessage = (state) => () => {
  initi18next(errorMessagesRU, errorMessagesEN)
    .then((translate) => {
      const inputWebErrorMessage = document.querySelector('#inputWebErrorMessage');

      inputWebErrorMessage.textContent = translate(state.errorMessage);
    });
};

export const updateFormRSS = (state) => () => {
  const inputWeb = document.querySelector('#inputWeb');
  const buttonSubmit = document.querySelector('#buttonSubmit');
  const buttonSubmitSpinner = buttonSubmit.querySelector('#buttonSubmitSpinner');

  switch (state.formRssStatus) {
    case formRssStatuses.clear:
      inputWeb.value = '';
      buttonSubmit.disabled = true;
      inputWeb.disabled = false;
      inputWeb.classList.remove('is-valid');
      inputWeb.classList.remove('is-invalid');
      buttonSubmitSpinner.classList.add('d-none');
      break;
    case formRssStatuses.valid:
      buttonSubmit.disabled = false;
      inputWeb.classList.remove('is-invalid');
      inputWeb.classList.add('is-valid');
      break;
    case formRssStatuses.invalid:
      buttonSubmit.disabled = true;
      inputWeb.disabled = false;
      inputWeb.classList.remove('is-valid');
      inputWeb.classList.add('is-invalid');
      buttonSubmitSpinner.classList.add('d-none');
      break;
    case formRssStatuses.load:
      buttonSubmit.disabled = true;
      inputWeb.disabled = true;
      buttonSubmitSpinner.classList.remove('d-none');
      break;
    default:
  }
};

export const renderFeeds = (state) => () => {
  const feedsList = document.querySelector('#feeds');
  const feeds = state.feeds.map((feed) => (
    `<li class="list-group-item">
      <h6>${feed.title}</h6>
      ${feed.description}
    </li>`
  ));

  feedsList.innerHTML = feeds.join('');
};

export const renderAllArticles = (state) => () => {
  const articlesList = document.querySelector('#articles');
  const articles = state.allArticles.map(({ title, link }) => (
    `<div class="col-sm-6 mb-3">
      <div class="card">
        <div class="card-body">
          <a href=${link} class="card-link" data-toggle="modal" data-target="#articleModal">${title}</a>
        </div>
      </div>
    </div>`
  ));

  articlesList.innerHTML = articles.join('');
};

export const renderModal = (state) => () => {
  const articleModalTitle = document.querySelector('#articleModalTitle');
  const articleModalBody = document.querySelector('#articleModalBody');

  articleModalTitle.textContent = state.modal.title;
  articleModalBody.textContent = state.modal.description;
};
