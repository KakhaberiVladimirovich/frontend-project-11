const parser = new DOMParser();

export default (contents) => {
  const xmlDocument = parser.parseFromString(contents, 'application/xml');
  const rootTagName = xmlDocument.documentElement.tagName.toLowerCase();
  if (rootTagName !== 'rss') {
    throw new Error('inputFeedback.errors.notValidRSS');
  }

  const feedTitle = xmlDocument.querySelector('title').textContent;
  const feedDescription = xmlDocument.querySelector('description').textContent;
  const feed = { feedTitle, feedDescription };

  const itemElements = xmlDocument.querySelectorAll('item');
  const posts = [...itemElements].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      title,
      description,
      link,
    };
  });

  const parsedRSS = { feed, posts };

  return Promise.resolve(parsedRSS);
};
