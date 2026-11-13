export default {
  id: 'javascript',
  title: 'JavaScript',
  tagline: 'Program the browser: functions, arrays, objects, the DOM, events and async code.',
  color: '#b8860b',
  type: 'js',
  challenges: [
    {
      id: 'js-01',
      title: 'Variables and functions',
      body: `<p>Declare values with <code>const</code> (or <code>let</code> when they change). A function takes parameters and <code>return</code>s a result.</p>
<p>Write <code>toFahrenheit(celsius)</code> that returns the temperature in Fahrenheit (multiply by 9/5, add 32), and <code>fullName(first, last)</code> that returns both names joined by one space, using a template literal.</p>`,
      seed: `function toFahrenheit(celsius) {\n  // return the converted value\n}\n\n// write fullName(first, last) below\n`,
      tests: [
        { text: 'toFahrenheit(0) returns 32', test: `toFahrenheit(0) === 32` },
        { text: 'toFahrenheit(100) returns 212', test: `toFahrenheit(100) === 212` },
        { text: 'toFahrenheit(-40) returns -40', test: `toFahrenheit(-40) === -40` },
        { text: 'fullName("Ana", "Reyes") returns "Ana Reyes"', test: `fullName('Ana', 'Reyes') === 'Ana Reyes'` },
        { text: 'fullName works for any two names', test: `fullName('Jose', 'Rizal') === 'Jose Rizal'` },
      ],
    },
    {
      id: 'js-02',
      title: 'Conditions and comparisons',
      body: `<p>Use <code>if</code> / <code>else if</code> / <code>else</code> with the strict comparison operators (<code>===</code>, <code>!==</code>, <code>&gt;=</code>…) to make decisions.</p>
<p>Write <code>remark(score)</code>. It returns <code>"Invalid"</code> when the score is not a number or is outside 0–100, <code>"Excellent"</code> for 90 and above, <code>"Passed"</code> for 75 to 89, and <code>"Failed"</code> below 75.</p>`,
      seed: `function remark(score) {\n\n}\n`,
      tests: [
        { text: 'remark(95) returns "Excellent"', test: `remark(95) === 'Excellent'` },
        { text: 'remark(90) returns "Excellent" (the boundary counts)', test: `remark(90) === 'Excellent'` },
        { text: 'remark(75) and remark(89) return "Passed"', test: `remark(75) === 'Passed' && remark(89) === 'Passed'` },
        { text: 'remark(74) and remark(0) return "Failed"', test: `remark(74) === 'Failed' && remark(0) === 'Failed'` },
        { text: 'remark(101) and remark(-1) return "Invalid"', test: `remark(101) === 'Invalid' && remark(-1) === 'Invalid'` },
        { text: 'remark("85") returns "Invalid" because it is a string', test: `remark('85') === 'Invalid'` },
      ],
    },
    {
      id: 'js-03',
      title: 'Array methods: map, filter, reduce',
      body: `<p>Arrays come with methods that replace most loops. <code>map</code> transforms every item, <code>filter</code> keeps some items, and <code>reduce</code> folds the array into one value.</p>
<p>Each cart item looks like <code>{ name: "Pen", price: 12, qty: 3 }</code>. Write three functions, none of which may change the original array:</p>
<ul><li><code>itemNames(cart)</code> – an array of the names</li><li><code>affordable(cart, max)</code> – the items whose price is at most <code>max</code></li><li><code>cartTotal(cart)</code> – the sum of price × qty (0 for an empty cart)</li></ul>`,
      prelude: `const __cart = () => [{ name: 'Pen', price: 12, qty: 3 }, { name: 'Notebook', price: 45, qty: 2 }, { name: 'Bag', price: 650, qty: 1 }];`,
      seed: `function itemNames(cart) {\n\n}\n\nfunction affordable(cart, max) {\n\n}\n\nfunction cartTotal(cart) {\n\n}\n`,
      tests: [
        { text: 'itemNames returns ["Pen", "Notebook", "Bag"]', test: `JSON.stringify(itemNames(__cart())) === '["Pen","Notebook","Bag"]'` },
        { text: 'affordable(cart, 50) returns the Pen and the Notebook', test: `JSON.stringify(affordable(__cart(), 50).map(i => i.name)) === '["Pen","Notebook"]'` },
        { text: 'affordable includes an item priced exactly at max', test: `affordable(__cart(), 45).length === 2` },
        { text: 'cartTotal returns 776', test: `cartTotal(__cart()) === 776` },
        { text: 'cartTotal([]) returns 0', test: `cartTotal([]) === 0` },
        { text: 'The original array is not modified', test: `(c => (itemNames(c), affordable(c, 50), cartTotal(c), JSON.stringify(c) === JSON.stringify(__cart())))(__cart())` },
      ],
    },
    {
      id: 'js-04',
      title: 'Objects and strings',
      body: `<p>Objects store key–value pairs. You can add keys on the fly with bracket notation, and loop over them with <code>Object.keys</code> or <code>Object.entries</code>.</p>
<p>Write <code>wordCount(text)</code> that returns an object counting how often each word appears. Ignore case and punctuation (<code>. , ! ?</code>), and return an empty object for an empty string. Then write <code>topWord(text)</code> that returns the most frequent word.</p>`,
      seed: `function wordCount(text) {\n\n}\n\nfunction topWord(text) {\n\n}\n`,
      tests: [
        { text: 'wordCount("a b a") returns { a: 2, b: 1 }', test: `JSON.stringify(wordCount('a b a')) === '{"a":2,"b":1}'` },
        { text: 'Counting ignores upper and lower case', test: `wordCount('Code code CODE').code === 3` },
        { text: 'Punctuation is ignored', test: `(r => r.hello === 2 && r.world === 1 && Object.keys(r).length === 2)(wordCount('Hello, world! Hello?'))` },
        { text: 'wordCount("") returns an empty object', test: `JSON.stringify(wordCount('')) === '{}'` },
        { text: 'topWord returns the most frequent word', test: `topWord('to be or not to be to') === 'to'` },
      ],
    },
    {
      id: 'js-05',
      title: 'The DOM and events',
      body: `<p>JavaScript reaches the page through the DOM. <code>document.querySelector</code> finds an element, <code>textContent</code> changes its text, and <code>addEventListener</code> runs your function when something happens.</p>
<p>The page already contains this HTML:</p>
<pre>&lt;button id="add"&gt;Add&lt;/button&gt;
&lt;button id="reset"&gt;Reset&lt;/button&gt;
&lt;span id="count"&gt;0&lt;/span&gt;</pre>
<p>Make <b>Add</b> increase the number shown in <code>#count</code> by one per click, and <b>Reset</b> set it back to 0. When the count reaches 5 or more, add the class <code>high</code> to <code>#count</code>; remove it on reset.</p>`,
      html: `<button id="add">Add</button> <button id="reset">Reset</button> <span id="count">0</span>`,
      seed: `const addBtn = document.querySelector('#add')\nconst countEl = document.querySelector('#count')\n\n// your code here\n`,
      tests: [
        { text: 'One click on Add shows 1', test: `($('#add').click(), $('#count').textContent.trim() === '1')` },
        { text: 'Three clicks on Add show 3', test: `($('#add').click(), $('#add').click(), $('#add').click(), $('#count').textContent.trim() === '3')` },
        { text: 'Reset puts the count back to 0', test: `($('#add').click(), $('#add').click(), $('#reset').click(), $('#count').textContent.trim() === '0')` },
        { text: 'Adding after a reset starts again from 1', test: `($('#add').click(), $('#reset').click(), $('#add').click(), $('#count').textContent.trim() === '1')` },
        { text: '#count gets the class "high" at 5 and not before', test: `($('#add').click(), $('#add').click(), $('#add').click(), $('#add').click(), !$('#count').classList.contains('high') && ($('#add').click(), $('#count').classList.contains('high')))` },
        { text: 'Reset removes the class "high"', test: `([1,2,3,4,5].forEach(() => $('#add').click()), $('#reset').click(), !$('#count').classList.contains('high'))` },
      ],
    },
    {
      id: 'js-06',
      title: 'Promises and async / await',
      body: `<p>Anything that takes time (a network request, a database call) returns a <code>Promise</code>. Inside an <code>async</code> function, <code>await</code> pauses until the promise settles, and <code>try / catch</code> handles a rejection.</p>
<p>A function <code>fetchStudent(id)</code> is already provided. It resolves with an object like <code>{ id: 1, name: "Ana" }</code> after a short delay, and <b>rejects</b> when the id does not exist.</p>
<ul><li>Write <code>async function getName(id)</code> that returns the student's name in UPPERCASE, or <code>"Unknown"</code> when the request fails.</li><li>Write <code>async function getNames(ids)</code> that returns an array of those names for many ids, loading them at the same time with <code>Promise.all</code>.</li></ul>`,
      prelude: `let __calls = 0, __active = 0, __peak = 0;
const fetchStudent = (id) => { __calls++; __active++; __peak = Math.max(__peak, __active); return new Promise((res, rej) => setTimeout(() => { __active--; const s = { 1: 'Ana', 2: 'Ben', 3: 'Cara' }[id]; s ? res({ id, name: s }) : rej(new Error('Student not found')); }, 15)); };`,
      seed: `async function getName(id) {\n\n}\n\nasync function getNames(ids) {\n\n}\n`,
      tests: [
        { text: 'getName returns a promise', test: `getName(1) instanceof Promise` },
        { text: 'getName(1) resolves to "ANA"', test: `(await getName(1)) === 'ANA'` },
        { text: 'getName(99) resolves to "Unknown" instead of throwing', test: `(await getName(99)) === 'Unknown'` },
        { text: 'getNames([1, 2, 3]) resolves to ["ANA", "BEN", "CARA"]', test: `JSON.stringify(await getNames([1, 2, 3])) === '["ANA","BEN","CARA"]'` },
        { text: 'getNames keeps "Unknown" in place for a missing id', test: `JSON.stringify(await getNames([2, 50])) === '["BEN","Unknown"]'` },
        { text: 'getNames loads the students at the same time, not one by one', test: `(await getNames([1, 2, 3]), __peak === 3)` },
      ],
    },
  ],
  quiz: [
    { q: 'What is the difference between let and const?', a: ['A const binding cannot be reassigned', 'A const binding cannot hold objects', 'A let binding is global to all files', 'A let binding cannot be reassigned'] },
    { q: 'What does [1, 2, 3].map(n => n * 2) return?', a: ['[2, 4, 6]', '[1, 2, 3]', '[1, 4, 9]', '[2, 2, 2]'] },
    { q: 'What is the result of "5" === 5?', a: ['false, because the types differ', 'true, because the values match', 'true, because of type coercion', 'an error, because types differ'] },
    { q: 'Which method registers a function to run when a button is clicked?', a: ['addEventListener', 'querySelector', 'setAttribute', 'appendChild'] },
    { q: 'What does an async function always return?', a: ['A promise', 'A string', 'A callback', 'Undefined'] },
    { q: 'Which array method returns a new array containing only the items that pass a test?', a: ['filter', 'reduce', 'forEach', 'splice'] },
    { q: 'Inside an async function, how do you handle a rejected promise you awaited?', a: ['Wrap the await in try / catch', 'Wrap the await in if / else', 'Add a second await after it', 'Call return before the await'] },
    { q: 'What does document.querySelector(".card") return when nothing matches?', a: ['null', 'NaN', 'false', 'zero'] },
  ],
  project: {
    title: 'Interactive To-Do App',
    brief: 'Build a to-do list in plain HTML, CSS and JavaScript (no libraries). Tasks must survive a page refresh.',
    requirements: [
      'Add, complete and delete tasks without reloading the page',
      'Filter buttons: All, Active, Completed, plus a live count of remaining tasks',
      'Tasks saved to localStorage and restored on load',
      'Input validation: empty or duplicate tasks are rejected with a visible message',
      'Uses array methods (map, filter) and event delegation rather than inline onclick',
      'Loads at least one piece of data with fetch and async / await (for example a daily quote)',
    ],
  },
}
