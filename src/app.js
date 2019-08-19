import { watch } from 'melanke-watchjs';
import { onInputWebInput, onFormRssSubmit, onArticlesListClick } from './handlers';
import {
  updateFormRSS,
  renderErrorMessage,
  renderFeeds,
  renderAllArticles,
  renderModal,
} from './renderers';

export default () => {
  const state = {
    formRssStatus: '',
    inputValue: '',
    errorMessage: '',
    feeds: [],
    allArticles: [],
    modal: {
      title: '',
      description: '',
    },
  };

  watch(state, 'formRssStatus', updateFormRSS(state));
  watch(state, 'errorMessage', renderErrorMessage(state));
  watch(state, 'feeds', renderFeeds(state));
  watch(state, 'allArticles', renderAllArticles(state));
  watch(state, 'modal', renderModal(state));

  const formRss = document.querySelector('#formRss');
  const articlesList = document.querySelector('#articles');
  const inputWeb = document.querySelector('#inputWeb');

  inputWeb.addEventListener('input', onInputWebInput(state));
  formRss.addEventListener('submit', onFormRssSubmit(state));
  articlesList.addEventListener('click', onArticlesListClick(state));
};
