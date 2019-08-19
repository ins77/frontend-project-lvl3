import formRssErrors from './formRssErrors';

export const errorMessagesEN = {
  [formRssErrors.notURL]: 'Enter URL',
  [formRssErrors.existingFeed]: 'You are already subscribed to this channel',
  [formRssErrors.notFound]: 'The page with the entered address does not exist',
  [formRssErrors.parserError]: 'Parser error',
  [formRssErrors.unknown]: 'Something went wrong :(',
  [formRssErrors.noError]: '',
};

export const errorMessagesRU = {
  [formRssErrors.notURL]: 'Введите URL',
  [formRssErrors.existingFeed]: 'Вы уже подписаны на этот канал',
  [formRssErrors.notFound]: 'Страницы с введенным адресом не существует',
  [formRssErrors.parserError]: 'Ошибка парсинга данных',
  [formRssErrors.unknown]: 'Что-то пошло не так :(',
  [formRssErrors.noError]: '',
};
