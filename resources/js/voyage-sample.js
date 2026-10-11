export const tourVersion = 2;

export const starterSource = `function App({ notes, onSave, error }) {
  const appName = 'My notes';
  const [title, setTitle] = React.useState('');
  const { Button, Input, Card } = Slipstream;

  function saveNote(event) {
    event.preventDefault();
    // Add onSave(title) here.
  }

  return (
    <div className="mx-auto max-w-lg p-6 sm:p-8">
      <p className="mb-3 text-xs font-semibold tracking-widest text-brand-light">
        YOUR NOTES APP
      </p>
      <h1 className="mb-3 text-3xl font-semibold tracking-tight text-content">
        {appName}
      </h1>
      <p className="mb-6 text-sm leading-6 text-content-muted">
        A place to keep ideas you want to build.
      </p>

      <Card>
        <form onSubmit={saveNote}>
          <label htmlFor="note-title" className="mb-2 block text-sm text-content">
            Your idea
          </label>
          <Input id="note-title" value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="My first idea"
            aria-describedby={error ? 'note-error' : undefined}
            aria-invalid={Boolean(error)} />
          {error && <p id="note-error" role="alert"
            className="mt-3 text-sm text-rose-300">{error}</p>}
          <Button type="submit" className="mt-4 w-full">Save note</Button>
        </form>
      </Card>

      <p data-voyage-count={notes.length} className="mt-6 text-sm text-content-muted">
        Saved notes: {notes.length}
      </p>
      <div data-voyage-notes className="mt-3 space-y-3" aria-live="polite">
        {/* Render your notes here. */}
      </div>
    </div>
  );
}`;

export const missions = [
    {
        id: 'name',
        title: 'Name your notes app',
        description: 'Give the page a name people will see.',
        why: 'appName is a JavaScript value. React displays it where the page uses {appName}. Changing that value changes the heading.',
        find: "const appName = 'My notes';",
        replacement: "const appName = 'My ideas';",
        check: 'Your new name appears at the top of the live preview. Choose any name you like.',
        hint: "Edit the words between the quotes and keep the semicolon. If your name contains an apostrophe, use double quotes: const appName = \"Sean's notes\";",
        concepts: ['JavaScript values', 'JSX'],
    },
    {
        id: 'save',
        title: 'Connect the Save button',
        description: 'Make the form save the idea you type.',
        why: 'The input already keeps what you type in title. Calling onSave(title) sends that value to Zefram to validate and store.',
        find: '// Add onSave(title) here.',
        replacement: 'onSave(title);',
        check: 'Type My first idea in the preview and press Save note. The saved count increases first; Step 3 will show the note itself. Optional: clear the field and press Save note to see validation.',
        hint: 'Replace the comment inside saveNote, just after event.preventDefault(). JS stores notes in your browser; PHP sends them to Laravel and SQLite. The next step makes those saved notes visible.',
        concepts: ['Form events', 'Validation', 'Storage'],
    },
    {
        id: 'render',
        title: 'Show your saved ideas',
        description: 'Display the notes below your form.',
        why: 'Zefram supplies notes as an array. map renders a Card for each note, and key gives React a stable identity for each row.',
        find: '{/* Render your notes here. */}',
        replacement: `{notes.map((note) => (
  <Card key={note.id} data-voyage-note={note.id} className="p-4">
    <p className="text-sm text-content">{note.title}</p>
  </Card>
))}`,
        check: 'Your saved idea appears below the form. Optional: save another idea, then reload this page to see both waiting for you.',
        hint: 'Replace the whole JSX comment, including its braces. notes.map visits each saved note; {note.title} displays its text. You can change the card styling after it works.',
        concepts: ['Arrays', 'Rendering lists', 'React keys'],
    },
];