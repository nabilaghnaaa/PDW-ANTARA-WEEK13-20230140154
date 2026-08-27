/**
 * Custom Web Component for a reusable button element.
 */
class CustomButton extends HTMLElement {
  connectedCallback() {
    const text = this.getAttribute("text") || "Button";
    const btnClass = this.getAttribute("btn-class") || "btn-primary";
    const id = this.getAttribute("id") || "";

    this.innerHTML = `<button id="${id}" class="btn ${btnClass}">${text}</button>`;
  }
}
customElements.define("custom-button", CustomButton);

/**
 * Custom Web Component for a reusable input field (general and password).
 */
class CustomInput extends HTMLElement {
  connectedCallback() {
    const type = this.getAttribute("type") || "text";
    const label = this.getAttribute("label") || "Input";
    const name = this.getAttribute("name") || "";
    const id = this.getAttribute("id") || name;

    this.innerHTML = `
            <div class="mb-3">
                <label for="${id}" class="form-label">${label}</label>
                <input type="${type}" class="form-control" id="${id}" name="${name}" required>
            </div>
        `;
  }
}
customElements.define("custom-input", CustomInput);
