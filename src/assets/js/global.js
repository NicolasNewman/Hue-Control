module.exports = {
    toggleVisibility: (element, state) => {
        if (element.style) {
            element.style.display = state;
        }
    }
}