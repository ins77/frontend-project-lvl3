import formRssErrors from './constants/formRssErrors';
import formRssStatuses from './constants/formRssStatuses';

const inputWeb = document.querySelector('#inputWeb');
const inputWebErrorMessage = document.querySelector('#inputWebErrorMessage');
const buttonSubmit = document.querySelector('#buttonSubmit');
const buttonSubmitSpinner = buttonSubmit.querySelector('#buttonSubmitSpinner');
const feedsList = document.querySelector('#feeds');
const articlesList = document.querySelector('#articles');
const articleModalTitle = document.querySelector('#articleModalTitle');
const articleModalBody = document.querySelector('#articleModalBody');

const errorMessages = {
  [formRssErrors.notURL]: 'Введите URL',
  [formRssErrors.existingFeed]: 'Вы уже подписаны на этот канал',
  [formRssErrors.notFound]: 'Страницы с введенным адресом не существует',
  [formRssErrors.notRSS]: 'Данные по введенному адресу не соответствуют формату RSS',
  [formRssErrors.unknown]: 'Что-то пошло не так :(',
  [formRssErrors.noError]: '',
};

export const renderErrorMessage = (state) => () => {
  inputWebErrorMessage.textContent = errorMessages[state.errorMessage];
};

export const renderFormRSS = (state) => () => {
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
  const feeds = state.feeds.map((feed) => (
    `<li class="list-group-item">
      <h6>${feed.title}</h6>
      ${feed.description}
    </li>`
  ));

  feedsList.innerHTML = feeds.join('');
};

export const renderAllArticles = (state) => () => {
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
  articleModalTitle.textContent = state.modal.title;
  articleModalBody.textContent = state.modal.description;
};
