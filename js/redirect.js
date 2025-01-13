// 현재 URL에서 data 파라미터 가져오기
const currentUrl = new URL(window.location.href);
const encodedData = currentUrl.searchParams.get("data") || "[]"; // 기본값: 빈 배열

function redirectToSubmit() {
    // 문제 제목 가져오기 및 인코딩
    const title = document.querySelector(".problem-title").innerText; 

    // 현재 페이지 파일 이름 가져오기
    const currentPageId = window.location.pathname.split('/').pop().replace('.html', ''); // 예: "0001"

    // submit.html로 리다이렉트
    window.location.href = `../submit.html?title=${title}&data=${encodedData}&id=${currentPageId}`;
}