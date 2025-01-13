// URL에서 title 쿼리 파라미터 읽어오기
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get("title");
    if (title) {
        document.getElementById("title").innerText = decodeURIComponent(title)
    }
});