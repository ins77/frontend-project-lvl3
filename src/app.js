import { watch } from 'melanke-watchjs';
import { onInputWebInput, onFormRssSubmit, onArticlesListClick } from './handlers';
import {
  renderFormRSS,
  renderErrorMessage,
  renderFeeds,
  renderAllArticles,
  renderModal,
} from './renderers';

const formRss = document.querySelector('#formRss');
const articlesList = document.querySelector('#articles');
const inputWeb = document.querySelector('#inputWeb');

export default () => {
  const state = {
    formRssStatus: '', // TODO:  вынести в константы названия статусов
    errorMessage: '',
    feeds: [],
    allArticles: [],
    modal: {
      title: '',
      description: '',
    },
  };

  watch(state, 'formRssStatus', renderFormRSS(state));
  watch(state, 'errorMessage', renderErrorMessage(state));
  watch(state, 'feeds', renderFeeds(state));
  watch(state, 'allArticles', renderAllArticles(state));
  watch(state, 'modal', renderModal(state));

  inputWeb.addEventListener('input', onInputWebInput(state));
  formRss.addEventListener('submit', onFormRssSubmit(state));
  articlesList.addEventListener('click', onArticlesListClick(state));
};
