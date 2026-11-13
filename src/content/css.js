const page = (body, css = '    /* Write your CSS here */') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Practice</title>
  <style>
${css}
  </style>
</head>
<body>
${body}
</body>
</html>`

export default {
  id: 'css',
  title: 'CSS',
  tagline: 'Style and lay out pages: selectors, the box model, Flexbox, Grid and responsive design.',
  color: '#264de4',
  type: 'css',
  challenges: [
    {
      id: 'css-01',
      title: 'Selectors and colors',
      body: `<p>A CSS rule is a selector plus declarations. Select by element (<code>h1</code>), by class (<code>.lead</code>) or by id (<code>#note</code>).</p>
<p>Inside the <code>&lt;style&gt;</code> block: make the <code>h1</code> <code>navy</code> and centered, set the <code>.lead</code> paragraph to <code>20px</code>, and give <code>#note</code> a <code>yellow</code> background.</p>`,
      seed: page('  <h1>Campus News</h1>\n  <p class="lead">Enrollment opens on Monday.</p>\n  <p id="note">Bring your ID.</p>'),
      tests: [
        { text: 'The h1 text color is navy', test: `css($('h1'), 'color') === 'rgb(0, 0, 128)'` },
        { text: 'The h1 is centered with text-align', test: `css($('h1'), 'textAlign') === 'center'` },
        { text: 'The .lead paragraph has font-size 20px', test: `css($('.lead'), 'fontSize') === '20px'` },
        { text: 'The #note paragraph has a yellow background', test: `css($('#note'), 'backgroundColor') === 'rgb(255, 255, 0)'` },
        { text: 'The other paragraph did not also turn yellow', test: `css($('.lead'), 'backgroundColor') !== 'rgb(255, 255, 0)'` },
      ],
    },
    {
      id: 'css-02',
      title: 'The box model',
      body: `<p>Every element is a box: content, then <code>padding</code>, then <code>border</code>, then <code>margin</code>. With <code>box-sizing: border-box</code>, the <code>width</code> you set includes padding and border, which makes sizes predictable.</p>
<p>Style <code>.card</code>: width <code>300px</code>, padding <code>16px</code>, a <code>2px solid</code> border, margin <code>24px</code> on top and bottom with <code>auto</code> left and right, a border radius of <code>12px</code>, and <code>border-box</code> sizing.</p>`,
      seed: page('  <div class="card">\n    <h2>Ana Reyes</h2>\n    <p>BSCS 3A</p>\n  </div>'),
      tests: [
        { text: '.card uses box-sizing: border-box', test: `css($('.card'), 'boxSizing') === 'border-box'` },
        { text: '.card is exactly 300px wide, border and padding included', test: `Math.round($('.card').getBoundingClientRect().width) === 300` },
        { text: '.card has 16px padding on all sides', test: `['paddingTop','paddingRight','paddingBottom','paddingLeft'].every(p => css($('.card'), p) === '16px')` },
        { text: '.card has a 2px solid border', test: `css($('.card'), 'borderTopWidth') === '2px' && css($('.card'), 'borderTopStyle') === 'solid'` },
        { text: '.card has 24px top and bottom margin and is centered with auto', test: `css($('.card'), 'marginTop') === '24px' && css($('.card'), 'marginBottom') === '24px' && rule('.card') && /auto/.test(rule('.card').marginLeft + rule('.card').margin)` },
        { text: '.card has a 12px border radius', test: `css($('.card'), 'borderTopLeftRadius') === '12px'` },
      ],
    },
    {
      id: 'css-03',
      title: 'Flexbox navigation bar',
      body: `<p>Flexbox lays children out in one direction. <code>justify-content</code> distributes them along the main axis and <code>align-items</code> along the cross axis. <code>gap</code> puts space between them.</p>
<p>Make <code>.nav</code> a flex container that pushes the logo and the links to opposite ends and centers them vertically. Make <code>.links</code> a flex container too, with a <code>16px</code> gap, and remove its bullets and padding.</p>`,
      seed: page('  <nav class="nav">\n    <strong class="logo">WebPath</strong>\n    <ul class="links">\n      <li><a href="#">Home</a></li>\n      <li><a href="#">Tracks</a></li>\n      <li><a href="#">Profile</a></li>\n    </ul>\n  </nav>'),
      tests: [
        { text: '.nav is a flex container', test: `css($('.nav'), 'display') === 'flex'` },
        { text: '.nav uses justify-content: space-between', test: `css($('.nav'), 'justifyContent') === 'space-between'` },
        { text: '.nav centers its items with align-items', test: `css($('.nav'), 'alignItems') === 'center'` },
        { text: '.links is a flex container with a 16px gap', test: `css($('.links'), 'display') === 'flex' && css($('.links'), 'columnGap') === '16px'` },
        { text: '.links has no bullets and no left padding', test: `css($('.links'), 'listStyleType') === 'none' && css($('.links'), 'paddingLeft') === '0px'` },
        { text: 'The three links sit side by side on one line', test: `new Set($$('.links li').map(li => Math.round(li.getBoundingClientRect().top))).size === 1` },
      ],
    },
    {
      id: 'css-04',
      title: 'Grid gallery',
      body: `<p>CSS Grid lays children out in rows <em>and</em> columns. <code>grid-template-columns: repeat(3, 1fr)</code> makes three equal columns. A child can stretch across columns with <code>grid-column: span 2</code>.</p>
<p>Turn <code>.gallery</code> into a three-column grid of equal widths with a <code>12px</code> gap, and make the <code>.wide</code> item span two columns.</p>`,
      seed: page('  <div class="gallery">\n    <div class="item wide">1</div>\n    <div class="item">2</div>\n    <div class="item">3</div>\n    <div class="item">4</div>\n    <div class="item">5</div>\n  </div>', '    .item { background: #dbeafe; padding: 20px; }\n    /* Write your CSS here */'),
      tests: [
        { text: '.gallery is a grid container', test: `css($('.gallery'), 'display') === 'grid'` },
        { text: '.gallery has three columns', test: `css($('.gallery'), 'gridTemplateColumns').trim().split(/\\s+/).length === 3` },
        { text: 'The three columns are equal in width', test: `(c => c.length === 3 && Math.max(...c) - Math.min(...c) < 1)(css($('.gallery'), 'gridTemplateColumns').trim().split(/\\s+/).map(parseFloat))` },
        { text: '.gallery has a 12px gap between rows and columns', test: `css($('.gallery'), 'rowGap') === '12px' && css($('.gallery'), 'columnGap') === '12px'` },
        { text: '.wide spans two columns', test: `[css($('.wide'), 'gridColumnStart'), css($('.wide'), 'gridColumnEnd')].includes('span 2')` },
      ],
    },
    {
      id: 'css-05',
      title: 'Buttons, hover states and transitions',
      body: `<p>A pseudo-class such as <code>:hover</code> styles an element in a particular state. A <code>transition</code> animates the change instead of switching instantly.</p>
<p>Style <code>.btn</code> with a <code>green</code> background, <code>white</code> text, no border, <code>8px</code> radius, a pointer cursor and a transition on <code>background-color</code>. Then add a <code>.btn:hover</code> rule that changes the background to a different color.</p>`,
      seed: page('  <button class="btn">Enroll now</button>'),
      tests: [
        { text: '.btn has a green background and white text', test: `css($('.btn'), 'backgroundColor') === 'rgb(0, 128, 0)' && css($('.btn'), 'color') === 'rgb(255, 255, 255)'` },
        { text: '.btn has no border and an 8px radius', test: `css($('.btn'), 'borderTopStyle') === 'none' && css($('.btn'), 'borderTopLeftRadius') === '8px'` },
        { text: '.btn shows a pointer cursor', test: `css($('.btn'), 'cursor') === 'pointer'` },
        { text: '.btn has a transition on background-color', test: `/background-color|all/.test(css($('.btn'), 'transitionProperty')) && css($('.btn'), 'transitionDuration') !== '0s'` },
        { text: 'A .btn:hover rule sets a different background color', test: `rule('.btn:hover') !== undefined && rule('.btn:hover').backgroundColor !== '' && rule('.btn:hover').backgroundColor !== 'green'` },
      ],
    },
    {
      id: 'css-06',
      title: 'Variables and responsive layout',
      body: `<p>Custom properties (CSS variables) are declared on <code>:root</code> as <code>--name: value</code> and used with <code>var(--name)</code>. A media query applies rules only at certain screen sizes, which is how one page fits both phones and desktops.</p>
<p>Declare a <code>--brand</code> color on <code>:root</code> and use it for the <code>.title</code> color. Make <code>.cols</code> a flex row with a <code>20px</code> gap. Then, inside <code>@media (max-width: 600px)</code>, switch <code>.cols</code> to a column.</p>`,
      seed: page('  <h1 class="title">Web Programming</h1>\n  <div class="cols">\n    <section>Lecture</section>\n    <section>Laboratory</section>\n  </div>'),
      tests: [
        { text: ':root declares a --brand variable', test: `getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() !== ''` },
        { text: '.title takes its color from var(--brand)', test: `rule('.title') !== undefined && /var\\(\\s*--brand\\s*\\)/.test(rule('.title').color)` },
        { text: '.cols is a flex container with a 20px gap', test: `rule('.cols') !== undefined && rule('.cols').display === 'flex' && /20px/.test(rule('.cols').gap)` },
        { text: 'A media query for max-width: 600px exists', test: `mediaRule('max-width:600px', '.cols') !== undefined` },
        { text: 'Inside it, .cols switches to flex-direction: column', test: `mediaRule('max-width:600px', '.cols') !== undefined && mediaRule('max-width:600px', '.cols').flexDirection === 'column'` },
      ],
    },
  ],
  quiz: [
    { q: 'Which selector has the highest specificity?', a: ['#menu', '.menu', 'ul li', 'a:hover'] },
    { q: 'With box-sizing: border-box, what does the width property include?', a: ['Content, padding and border', 'Content, padding and margin', 'Content and margin only', 'Content and nothing else'] },
    { q: 'In a flex row, which property distributes items along the main axis?', a: ['justify-content', 'align-content', 'align-items', 'justify-items'] },
    { q: 'What does grid-template-columns: repeat(3, 1fr) create?', a: ['Three columns of equal width', 'Three rows of equal height', 'One column three units wide', 'Three columns of 1px width'] },
    { q: 'Where must a CSS variable be declared so that every element can use it?', a: ['On the :root selector', 'On the body selector', 'On the * selector only', 'In a @media rule'] },
    { q: 'What does @media (max-width: 600px) target?', a: ['Viewports 600px wide or narrower', 'Viewports 600px wide or broader', 'Elements 600px wide or narrower', 'Images 600px wide or narrower'] },
    { q: 'Which unit is relative to the font size of the root element?', a: ['rem', 'em', 'vw', 'px'] },
    { q: 'Two rules with equal specificity set the same property. Which one wins?', a: ['The one written later', 'The one written first', 'The one with more lines', 'The one in the head'] },
  ],
  project: {
    title: 'Responsive Landing Page',
    brief: 'Style a landing page for a campus organization or event using only HTML and CSS. It must look right on a phone and on a desktop.',
    requirements: [
      'External stylesheet; no inline styles and no CSS framework',
      'Color palette and spacing defined as CSS variables on :root',
      'Navigation bar built with Flexbox',
      'A card or gallery section built with CSS Grid',
      'At least one media query that changes the layout below 600px',
      'Hover and focus states on all links and buttons, with a transition',
    ],
  },
}
