let signup = document.querySelector(".signup");
let login = document.querySelector(".login");
let slider = document.querySelector(".slider");
let formSection = document.querySelector(".form-section");

signup.addEventListener("click", () => {
    slider.classList.add("moveslider");
    formSection.classList.add("form-section-move");
});

login.addEventListener("click", () => {
    slider.classList.remove("moveslider");
    formSection.classList.remove("form-section-move");
});

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);

    if (!messageDiv) {
        console.error(`Element with ID '${divId}' not found.`);
        return;
    }

    // Set message text
    messageDiv.innerHTML = message;

    // Show the modal
    messageDiv.style.visibility = "visible";
    messageDiv.style.opacity = "1";
    messageDiv.style.animation = "fadeIn 0.5s forwards";

    // Automatically hide after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = "fadeOut 10s forwards";
        setTimeout(() => {
            messageDiv.style.visibility = "hidden";
        }, 500); // Hide completely after fade out
    }, 3000);
}