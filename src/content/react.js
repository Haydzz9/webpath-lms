export default {
  id: 'react',
  title: 'React',
  tagline: 'Build interfaces from components: JSX, props, state, lists, forms and effects.',
  color: '#087ea4',
  type: 'react',
  challenges: [
    {
      id: 'react-01',
      title: 'Your first component',
      body: `<p>A React component is a function whose name starts with a capital letter and that returns JSX. JSX looks like HTML but uses <code>className</code> instead of <code>class</code>, and <code>{ }</code> to drop in JavaScript values.</p>
<p>Write a <code>Greeting</code> component that returns an <code>h1</code> with the class <code>hello</code> and the text <b>Hello, React!</b>. The <code>App</code> component at the bottom is what the preview shows.</p>`,
      seed: `function Greeting() {\n  // return some JSX\n}\n\nfunction App() {\n  return <Greeting />\n}\n`,
      tests: [
        { text: 'Greeting is a function component', test: `typeof Greeting === 'function'` },
        { text: 'It renders an <h1>', test: `(render(<Greeting />), $('h1') !== null)` },
        { text: 'The <h1> has the class "hello"', test: `(render(<Greeting />), $('h1.hello') !== null)` },
        { text: 'The text is "Hello, React!"', test: `(render(<Greeting />), $('h1').textContent === 'Hello, React!')` },
      ],
    },
    {
      id: 'react-02',
      title: 'Passing data with props',
      body: `<p>Props are how a parent passes data to a child, like attributes: <code>&lt;StudentCard name="Ana" /&gt;</code>. The component receives them as one object, usually destructured: <code>function StudentCard({ name })</code>.</p>
<p>Write <code>StudentCard</code> taking <code>name</code>, <code>course</code> and <code>year</code>. Render a <code>div</code> with class <code>card</code> containing an <code>h2</code> with the name and a <code>p</code> reading <code>Course: BSCS · Year 3</code> (using the props). If <code>year</code> is not given, it should default to <code>1</code>.</p>`,
      seed: `function StudentCard() {\n\n}\n\nfunction App() {\n  return <StudentCard name="Ana Reyes" course="BSCS" year={3} />\n}\n`,
      tests: [
        { text: 'It renders a div.card with an <h2> and a <p>', test: `(render(<StudentCard name="Ana" course="BSCS" year={3} />), $('div.card h2') !== null && $('div.card p') !== null)` },
        { text: 'The <h2> shows the name prop', test: `(render(<StudentCard name="Ben Cruz" course="BSIT" year={2} />), $('h2').textContent === 'Ben Cruz')` },
        { text: 'The <p> reads "Course: BSIT · Year 2" for those props', test: `(render(<StudentCard name="Ben Cruz" course="BSIT" year={2} />), $('p').textContent === 'Course: BSIT · Year 2')` },
        { text: 'year defaults to 1 when it is not passed', test: `(render(<StudentCard name="Cara" course="BSIS" />), $('p').textContent === 'Course: BSIS · Year 1')` },
      ],
    },
    {
      id: 'react-03',
      title: 'State with useState',
      body: `<p>State is data that a component remembers between renders. <code>const [count, setCount] = useState(0)</code> gives you the current value and a function to change it. Calling the setter re-renders the component.</p>
<p>Write a <code>Counter</code> with a <code>p</code> (id <code>value</code>) that reads <code>Count: 0</code>, a button with id <code>inc</code> that adds one, a button with id <code>dec</code> that subtracts one but never goes below 0, and a button with id <code>reset</code>.</p>`,
      seed: `function Counter() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <div>\n      <p id="value">Count: {count}</p>\n      {/* add the three buttons */}\n    </div>\n  )\n}\n\nfunction App() {\n  return <Counter />\n}\n`,
      tests: [
        { text: 'It starts at "Count: 0"', test: `(render(<Counter />), $('#value').textContent === 'Count: 0')` },
        { text: 'Clicking #inc twice shows "Count: 2"', test: `(render(<Counter />), await click($('#inc')), await click($('#inc')), $('#value').textContent === 'Count: 2')` },
        { text: 'Clicking #dec subtracts one', test: `(render(<Counter />), await click($('#inc')), await click($('#inc')), await click($('#dec')), $('#value').textContent === 'Count: 1')` },
        { text: '#dec never goes below 0', test: `(render(<Counter />), await click($('#dec')), await click($('#dec')), $('#value').textContent === 'Count: 0')` },
        { text: '#reset returns to "Count: 0"', test: `(render(<Counter />), await click($('#inc')), await click($('#inc')), await click($('#reset')), $('#value').textContent === 'Count: 0')` },
      ],
    },
    {
      id: 'react-04',
      title: 'Rendering lists and conditions',
      body: `<p>Turn an array into elements with <code>map</code>, and give each element a stable <code>key</code>. Use <code>&amp;&amp;</code> or a ternary to render something only when a condition holds.</p>
<p>Write <code>TaskList</code> taking a <code>tasks</code> prop, an array like <code>[{ id: 1, title: "Read", done: true }]</code>. Render a <code>ul</code> with one <code>li</code> per task showing its title; completed tasks get the class <code>done</code>. Below it, a <code>p</code> with class <code>summary</code> reading <code>1 of 3 done</code>. When the array is empty, render only a <code>p</code> with class <code>empty</code> reading <code>No tasks yet</code>.</p>`,
      seed: `function TaskList({ tasks }) {\n\n}\n\nfunction App() {\n  const tasks = [\n    { id: 1, title: 'Read Module 4', done: true },\n    { id: 2, title: 'Finish Lab 4', done: false },\n    { id: 3, title: 'Push to GitHub', done: false },\n  ]\n  return <TaskList tasks={tasks} />\n}\n`,
      tests: [
        { text: 'It renders one <li> per task', test: `(render(<TaskList tasks={[{id:1,title:'A',done:false},{id:2,title:'B',done:true},{id:3,title:'C',done:false}]} />), $$('ul li').length === 3)` },
        { text: 'Each <li> shows the task title', test: `(render(<TaskList tasks={[{id:1,title:'Read',done:false},{id:2,title:'Code',done:true}]} />), $$('li').map(l => l.textContent).join() === 'Read,Code')` },
        { text: 'Only completed tasks have the class "done"', test: `(render(<TaskList tasks={[{id:1,title:'A',done:false},{id:2,title:'B',done:true}]} />), !$$('li')[0].classList.contains('done') && $$('li')[1].classList.contains('done'))` },
        { text: 'p.summary reads "1 of 3 done"', test: `(render(<TaskList tasks={[{id:1,title:'A',done:false},{id:2,title:'B',done:true},{id:3,title:'C',done:false}]} />), $('p.summary').textContent === '1 of 3 done')` },
        { text: 'An empty list renders p.empty with "No tasks yet" and no <ul>', test: `(render(<TaskList tasks={[]} />), $('p.empty') !== null && $('p.empty').textContent === 'No tasks yet' && $('ul') === null)` },
      ],
    },
    {
      id: 'react-05',
      title: 'Controlled form inputs',
      body: `<p>In a controlled input, React state is the single source of truth: the input's <code>value</code> comes from state and its <code>onChange</code> handler updates that state.</p>
<p>Write <code>SignupForm</code> with a text input (id <code>name</code>), a <code>p</code> with id <code>preview</code> that reads <code>Hello, Ana!</code> as the user types (or <code>Hello, stranger!</code> while the input is empty or only spaces), and a submit button that is <code>disabled</code> until the name has at least 3 characters.</p>`,
      seed: `function SignupForm() {\n  const [name, setName] = useState('')\n\n  return (\n    <form>\n      {/* input, preview and button */}\n    </form>\n  )\n}\n\nfunction App() {\n  return <SignupForm />\n}\n`,
      tests: [
        { text: 'It starts with an empty input and "Hello, stranger!"', test: `(render(<SignupForm />), $('#name').value === '' && $('#preview').textContent === 'Hello, stranger!')` },
        { text: 'Typing "Ana" shows "Hello, Ana!"', test: `(render(<SignupForm />), await type($('#name'), 'Ana'), $('#preview').textContent === 'Hello, Ana!')` },
        { text: 'The input is controlled: its value follows the state', test: `(render(<SignupForm />), await type($('#name'), 'Ben'), $('#name').value === 'Ben')` },
        { text: 'Only spaces still shows "Hello, stranger!"', test: `(render(<SignupForm />), await type($('#name'), '   '), $('#preview').textContent === 'Hello, stranger!')` },
        { text: 'The button is disabled for fewer than 3 characters', test: `(render(<SignupForm />), await type($('#name'), 'Al'), $('button').disabled === true)` },
        { text: 'The button is enabled at 3 characters or more', test: `(render(<SignupForm />), await type($('#name'), 'Ana'), $('button').disabled === false)` },
      ],
    },
    {
      id: 'react-06',
      title: 'Side effects with useEffect',
      body: `<p><code>useEffect</code> runs code <em>after</em> React has updated the screen: fetching data, setting the document title, starting timers. The dependency array tells React when to run it again; an empty array means once, after the first render.</p>
<p>A function <code>loadCourses()</code> is passed in as a prop. It returns a promise that resolves to an array of course names. Write <code>CourseList</code> that:</p>
<ul><li>shows a <code>p</code> with class <code>loading</code> reading <code>Loading…</code> until the data arrives,</li><li>calls <code>loadCourses</code> exactly once, when the component first appears,</li><li>then renders the names in a <code>ul</code>, and</li><li>sets <code>document.title</code> to <code>3 courses</code> (using the real count) once loaded.</li></ul>`,
      seed: `function CourseList({ loadCourses }) {\n  const [courses, setCourses] = useState(null)\n\n  // useEffect goes here\n\n  return <p className="loading">Loading…</p>\n}\n\nfunction App() {\n  const fake = () =>\n    new Promise((resolve) => setTimeout(() => resolve(['HTML', 'CSS', 'JavaScript']), 600))\n  return <CourseList loadCourses={fake} />\n}\n`,
      tests: [
        { text: 'It shows p.loading with "Loading…" before the data arrives', test: `(render(<CourseList loadCourses={() => new Promise(r => setTimeout(() => r(['A']), 80))} />), $('p.loading') !== null && $('p.loading').textContent === 'Loading…')` },
        { text: 'After loading, it renders one <li> per course', test: `(render(<CourseList loadCourses={() => Promise.resolve(['HTML', 'CSS', 'JS'])} />), await tick(60), $$('ul li').map(l => l.textContent).join() === 'HTML,CSS,JS')` },
        { text: 'The loading message disappears once loaded', test: `(render(<CourseList loadCourses={() => Promise.resolve(['HTML'])} />), await tick(60), $('p.loading') === null)` },
        { text: 'loadCourses is called exactly once', test: `await (async () => { let n = 0; render(<CourseList loadCourses={() => (n++, Promise.resolve(['A', 'B']))} />); await tick(80); return n === 1 })()` },
        { text: 'document.title becomes "2 courses" for two courses', test: `(render(<CourseList loadCourses={() => Promise.resolve(['A', 'B'])} />), await tick(80), document.title === '2 courses')` },
      ],
    },
  ],
  quiz: [
    { q: 'What must a React component function return?', a: ['JSX or null', 'An HTML file', 'A CSS class', 'A DOM query'] },
    { q: 'How does a parent component pass data to a child component?', a: ['Through props', 'Through state', 'Through hooks', 'Through keys'] },
    { q: 'What happens when you call a state setter such as setCount(1)?', a: ['React re-renders the component', 'React reloads the entire page', 'React resets all of the state', 'React removes the component'] },
    { q: 'Why does each element in a rendered list need a key?', a: ['So React can track items between renders', 'So React can style items between renders', 'So the browser can sort the list on load', 'So the list can be saved to local storage'] },
    { q: 'What does an empty dependency array in useEffect(fn, []) mean?', a: ['Run the effect once after the first render', 'Run the effect again after every render', 'Run the effect before the very first render', 'Never run the effect inside the browser'] },
    { q: 'Which attribute name does JSX use in place of the HTML class attribute?', a: ['className', 'classList', 'cssClass', 'htmlClass'] },
    { q: 'What makes an input a controlled component?', a: ['Its value comes from React state', 'Its value comes from the DOM node', 'Its value is read with a ref only', 'Its value is stored in a cookie'] },
    { q: 'Why should you never change state directly, as in count = count + 1?', a: ['React will not know it must re-render', 'React will throw a syntax error at once', 'React will render the component twice', 'React will delete the state variable'] },
  ],
  project: {
    title: 'Student Directory App',
    brief: 'Build a React single-page app (Vite) that lists students and lets the user search, add and remove them.',
    requirements: [
      'At least five components, each in its own file, with data flowing down through props',
      'A searchable, filterable list rendered with map and stable keys',
      'A controlled form with validation for adding a student',
      'State lifted to the right parent; no direct DOM manipulation',
      'Initial data loaded in useEffect from a JSON file or public API, with loading and error states',
      'Deployed (Vercel, Netlify or GitHub Pages) with the repository link included',
    ],
  },
}
