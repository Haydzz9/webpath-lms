const page = (b) => `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Practice</title></head>\n<body>\n${b}\n</body>\n</html>`
export default {
  'html-01': page('<h1>Hello, Web!</h1><p>I am a CS student.</p>'),
  'html-02': page('<h1>My Study Plan</h1><h2>Subjects</h2><ul><li>Web</li><li>OOP</li><li>DSA</li></ul><h2>Steps</h2><ol><li>Read</li><li>Code</li><li>Review</li></ol><p>This is <strong>important</strong> and <em>fun</em>.</p>'),
  'html-03': page('<h1 id="top">Resources</h1><a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">MDN</a><figure><img src="cat.png" alt="A cat on a keyboard"><figcaption>My cat</figcaption></figure><a href="#top">Back to top</a>'),
  'html-04': page('<table><caption>Class Schedule</caption><thead><tr><th>Subject</th><th>Day</th><th>Time</th></tr></thead><tbody><tr><td>Web</td><td>Mon</td><td>8</td></tr><tr><td>OOP</td><td>Tue</td><td>9</td></tr><tr><td>DSA</td><td>Wed</td><td>10</td></tr></tbody></table>'),
  'html-05': page('<form action="/register" method="post"><label for="e">Email</label><input id="e" type="email" name="email" required><label for="p">Password</label><input id="p" type="password" name="password" minlength="8" required><label for="s">Section</label><select id="s" name="section"><option>3A</option><option>3B</option><option>3C</option></select><button type="submit">Register</button></form>'),
  'html-06': page('<header><h1>Ana</h1><nav><ul><li><a href="#a">About</a></li><li><a href="#w">Work</a></li><li><a href="#c">Contact</a></li></ul></nav></header><main><section id="a"><h2>About</h2><p>Hi</p></section><section id="w"><h2>Work</h2><p>Stuff</p></section></main><footer><p>2026</p></footer>'),
}
