const page = (body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Practice</title>
</head>
<body>
${body}
</body>
</html>`

export default {
  id: 'html',
  title: 'HTML',
  tagline: 'Structure every page correctly: text, links, tables, forms and semantic layout.',
  color: '#e34c26',
  type: 'html',
  challenges: [
    {
      id: 'html-01',
      title: 'Your first complete page',
      body: `<p>Every HTML document has the same skeleton: a <code>&lt;!DOCTYPE html&gt;</code> line, an <code>&lt;html&gt;</code> element with a <code>lang</code> attribute, a <code>&lt;head&gt;</code> for information about the page, and a <code>&lt;body&gt;</code> for what the visitor sees.</p>
<p>Write a full page from scratch. Give it a title, an <code>h1</code> that says <b>Hello, Web!</b> and one paragraph about yourself.</p>`,
      seed: `<!-- Type the whole document here, starting with the doctype -->\n`,
      tests: [
        { text: 'The document starts with <!DOCTYPE html>', test: `document.doctype !== null && document.doctype.name === 'html'` },
        { text: 'The <html> element has lang="en"', test: `document.documentElement.getAttribute('lang') === 'en'` },
        { text: 'The <head> contains a non-empty <title>', test: `$('head title') !== null && document.title.trim().length > 0` },
        { text: 'The body has an <h1> with the text "Hello, Web!"', test: `$('body h1') !== null && $('body h1').textContent.trim() === 'Hello, Web!'` },
        { text: 'The body has a <p> with some text', test: `$('body p') !== null && $('body p').textContent.trim().length > 0` },
      ],
    },
    {
      id: 'html-02',
      title: 'Headings, paragraphs and lists',
      body: `<p>Headings (<code>h1</code>–<code>h6</code>) give a page its outline. Use <code>ul</code> for lists where order does not matter and <code>ol</code> where it does. <code>strong</code> marks importance and <code>em</code> marks emphasis.</p>
<p>Inside the body, build a study plan: an <code>h1</code> saying <b>My Study Plan</b>, two <code>h2</code> sections, an unordered list of at least three subjects, an ordered list of at least three steps, and a paragraph that uses both <code>strong</code> and <code>em</code>.</p>`,
      seed: page('  <!-- Build your study plan here -->'),
      tests: [
        { text: 'There is exactly one <h1> and it says "My Study Plan"', test: `$$('h1').length === 1 && $('h1').textContent.trim() === 'My Study Plan'` },
        { text: 'There are at least two <h2> headings', test: `$$('h2').length >= 2` },
        { text: 'A <ul> has at least three <li> items', test: `$$('ul > li').length >= 3` },
        { text: 'An <ol> has at least three <li> items', test: `$$('ol > li').length >= 3` },
        { text: 'A <p> contains both <strong> and <em>', test: `$$('p').some(p => p.querySelector('strong') && p.querySelector('em'))` },
      ],
    },
    {
      id: 'html-03',
      title: 'Links and images',
      body: `<p>An anchor needs an <code>href</code>. A link that opens a new tab should have <code>target="_blank"</code> together with <code>rel="noopener"</code>. Every image needs an <code>alt</code> text that describes it for screen readers and for when the image fails to load.</p>
<p>Add: (1) a link to any <code>https://</code> site that opens in a new tab, (2) a <code>figure</code> holding an <code>img</code> and a <code>figcaption</code>, and (3) a link with <code>href="#top"</code> that jumps to an element whose <code>id</code> is <code>top</code>.</p>`,
      seed: page('  <h1>Resources</h1>\n  <!-- Add your links and image here -->'),
      tests: [
        { text: 'A link points to an https:// address', test: `$$('a').some(a => /^https:\\/\\//.test(a.getAttribute('href') || ''))` },
        { text: 'That link has target="_blank" and rel containing "noopener"', test: `$$('a[target="_blank"]').some(a => /^https:\\/\\//.test(a.getAttribute('href') || '') && /noopener/.test(a.getAttribute('rel') || ''))` },
        { text: 'A <figure> contains an <img> with src and a non-empty alt', test: `$('figure img') !== null && !!$('figure img').getAttribute('src') && ($('figure img').getAttribute('alt') || '').trim().length > 0` },
        { text: 'The <figure> has a <figcaption>', test: `$('figure figcaption') !== null && $('figure figcaption').textContent.trim().length > 0` },
        { text: 'A link with href="#top" exists and an element has id="top"', test: `$('a[href="#top"]') !== null && document.getElementById('top') !== null` },
      ],
    },
    {
      id: 'html-04',
      title: 'Tables for tabular data',
      body: `<p>Tables are for data that has rows and columns, never for page layout. A well-formed table has a <code>caption</code>, a <code>thead</code> whose cells are <code>th</code>, and a <code>tbody</code> whose cells are <code>td</code>.</p>
<p>Build a class schedule table with the caption <b>Class Schedule</b>, three column headings (for example Subject, Day, Time) and at least three rows of data.</p>`,
      seed: page('  <!-- Build the table here -->'),
      tests: [
        { text: 'The table has a <caption> that says "Class Schedule"', test: `$('table > caption') !== null && $('table > caption').textContent.trim() === 'Class Schedule'` },
        { text: 'The <thead> has one row with exactly three <th> cells', test: `$$('table > thead > tr').length === 1 && $$('table > thead > tr > th').length === 3` },
        { text: 'The <tbody> has at least three rows', test: `$$('table > tbody > tr').length >= 3` },
        { text: 'Every body row has exactly three <td> cells', test: `$$('table > tbody > tr').length > 0 && $$('table > tbody > tr').every(tr => tr.querySelectorAll('td').length === 3)` },
      ],
    },
    {
      id: 'html-05',
      title: 'A registration form',
      body: `<p>Forms collect input. Each control needs a <code>name</code> (so the server receives it) and a <code>label</code> whose <code>for</code> matches the control's <code>id</code>. HTML can validate for you with attributes such as <code>required</code>, <code>type="email"</code> and <code>minlength</code>.</p>
<p>Create a form with <code>action="/register"</code> and <code>method="post"</code> containing: a required email input named <code>email</code>, a required password input named <code>password</code> with <code>minlength="8"</code>, a <code>select</code> named <code>section</code> with at least three options, and a submit button. Give every control a label.</p>`,
      seed: page('  <h1>Register</h1>\n  <!-- Build the form here -->'),
      tests: [
        { text: 'The form has action="/register" and method="post"', test: `$('form') !== null && $('form').getAttribute('action') === '/register' && ($('form').getAttribute('method') || '').toLowerCase() === 'post'` },
        { text: 'A required input has type="email" and name="email"', test: `$('form input[type="email"][name="email"]') !== null && $('form input[name="email"]').required` },
        { text: 'A required password input has name="password" and minlength="8"', test: `$('form input[type="password"][name="password"]') !== null && $('form input[name="password"]').required && $('form input[name="password"]').getAttribute('minlength') === '8'` },
        { text: 'A <select> named "section" has at least three options', test: `$('form select[name="section"]') !== null && $$('form select[name="section"] option').length >= 3` },
        { text: 'Each of the three controls has a <label> whose "for" matches its id', test: `$$('form input[name="email"], form input[name="password"], form select[name="section"]').length === 3 && $$('form input[name="email"], form input[name="password"], form select[name="section"]').every(c => c.id && $('label[for="' + c.id + '"]') !== null)` },
        { text: 'The form has a submit button', test: `$('form button[type="submit"], form input[type="submit"]') !== null` },
      ],
    },
    {
      id: 'html-06',
      title: 'Semantic page layout',
      body: `<p>Semantic elements say what a region <em>is</em>: <code>header</code>, <code>nav</code>, <code>main</code>, <code>section</code>, <code>article</code>, <code>footer</code>. Browsers, search engines and screen readers all rely on them, and they replace most <code>div</code>s.</p>
<p>Lay out a small portfolio home page without using a single <code>div</code>: a <code>header</code> with an <code>h1</code>, a <code>nav</code> with a list of at least three links, one <code>main</code> holding at least two <code>section</code>s that each start with an <code>h2</code>, and a <code>footer</code> with a paragraph.</p>`,
      seed: page('  <!-- Lay out the page with semantic elements -->'),
      tests: [
        { text: 'A <header> contains the page <h1>', test: `$('body > header h1') !== null` },
        { text: 'A <nav> contains a list with at least three links', test: `$$('nav ul li a[href]').length >= 3` },
        { text: 'There is exactly one <main>', test: `$$('main').length === 1` },
        { text: '<main> has at least two <section>s, each with an <h2>', test: `$$('main section').length >= 2 && $$('main section').every(s => s.querySelector('h2'))` },
        { text: 'A <footer> contains a <p>', test: `$('body > footer p') !== null` },
        { text: 'No <div> is used anywhere', test: `$$('div').length === 0` },
      ],
    },
  ],
  quiz: [
    { q: 'Which element holds information about the page that is not shown in the browser window?', a: ['The head element', 'The body element', 'The main element', 'The meta element'] },
    { q: 'What does the alt attribute of an image provide?', a: ['Text shown or read when the image is missing', 'Text shown as a tooltip when it is hovered', 'A second image file loaded on slow networks', 'A caption printed under the image by default'] },
    { q: 'Which attribute connects a label to its input?', a: ['for on the label, matching the input id', 'name on the label, matching the input id', 'id on the label, matching the input name', 'for on the input, matching the label id'] },
    { q: 'Which pair of elements is correct for a row of column headings in a table?', a: ['A tr holding th cells', 'A th holding tr cells', 'A td holding th cells', 'A tr holding hd cells'] },
    { q: 'What is the purpose of <!DOCTYPE html>?', a: ['It tells the browser to use standards mode', 'It tells the browser which CSS file to use', 'It tells the server what file type to send', 'It tells the browser the language of a page'] },
    { q: 'Which element should appear only once per page and wrap its primary content?', a: ['main', 'section', 'article', 'header'] },
    { q: 'A link opens in a new tab. Which attribute should accompany target="_blank" for safety?', a: ['rel="noopener"', 'rel="nofollow"', 'rel="external"', 'rel="noscript"'] },
    { q: 'Which input attribute stops a form from being submitted while the field is empty?', a: ['required', 'readonly', 'disabled', 'pattern'] },
  ],
  project: {
    title: 'Personal Profile Page',
    brief: 'Build a one-page personal profile using only HTML. No CSS and no JavaScript: the goal is clean, valid, semantic structure.',
    requirements: [
      'Valid document skeleton with lang, charset, viewport meta and a meaningful title',
      'Semantic layout: header, nav with in-page links, main with at least three sections, footer',
      'One image with a descriptive alt inside a figure with a caption',
      'A table (for example your class schedule) with caption, thead and tbody',
      'A contact form with labels, at least four different control types and built-in validation',
      'Passes the W3C validator (validator.w3.org) with no errors',
    ],
  },
}
