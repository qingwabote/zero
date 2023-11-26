const textarea = document.getElementById("console_textarea") as HTMLTextAreaElement;

const _log = console.log;
console.log = function (...args) {
    textarea.textContent += args.join(' ') + '\n';
    textarea.scrollTop = textarea.scrollHeight;
    _log.apply(console, args)
}

window.addEventListener('error', function (e) {
    textarea.textContent += e.message + '\n';
    textarea.scrollTop = textarea.scrollHeight;
});

export { };
