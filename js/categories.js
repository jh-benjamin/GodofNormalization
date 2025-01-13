import { checkData } from './check.js';

const currentUrl = new URL(window.location.href);
const encodedData = currentUrl.searchParams.get("data") || "[]"; // 기본값: 빈 배열

document.addEventListener("DOMContentLoaded", () => {
    const categories = document.querySelectorAll(".category");
    const problemsSection = document.querySelector(".problems");
    const selectedCategorySection = document.querySelector(".selected-category");

    const problemsData = {
        "출력": [
            { title: "Hello World", id: "0001" },
            { title: "고양이", id: "0002" }
        ],
        "입력과 계산": [
            { title: "사칙연산", id: "0003" }
        ],
        "조건": [
            { title: "두 수 비교하기", id: "0004" },
            { title: "윤년", id: "0005" }
        ],
        "반복": [
            { title: "구구단", id: "0006" },
            { title: "별찍기", id: "0007" }
        ],
        "문자열": [
            { title: "아스키 코드", id: "0008" },
            { title: "문자와 문자열", id: "0009" },
            { title: "그대로 출력하기", id: "0010" }
        ]
    };

    // 진행률 업데이트 함수
    const updateProgress = () => {
        categories.forEach(category => {
            const categoryName = category.querySelector("h3").innerText;
            const problems = problemsData[categoryName] || [];
            
            // 해결된 문제 개수 계산
            const solved = problems.filter(problem => checkData(problem.id)).length;
            const total = problems.length;

            // 데이터셋 업데이트
            category.dataset.solved = solved;

            // 진행률 계산
            const progress = total > 0 ? Math.floor((solved / total) * 100) : 0;

            // 텍스트 업데이트
            const progressText = `${progress}% (${solved}/${total})`;
            category.querySelector("p").textContent = progressText;

            // 100% 완료 시 CSS 클래스 추가
            if (progress === 100) {
                category.classList.add("completed");
            } else {
                category.classList.remove("completed");
            }
        });
    };

    // Hide the selected-category section initially
    selectedCategorySection.style.display = "none";

    categories.forEach(category => {
        category.addEventListener("click", () => {
            categories.forEach(cat => cat.classList.remove("active"));
            category.classList.add("active");

            const categoryName = category.querySelector("h3").innerText;
            const problems = problemsData[categoryName] || [];

            // Show the selected-category section and update it
            selectedCategorySection.style.display = "block";

            const solvedCount = problems.filter(problem => checkData(problem.id)).length; // solved된 문제 개수 계산
            selectedCategorySection.querySelector("h3").innerText = categoryName;
            selectedCategorySection.querySelector("p").innerText = `${problems.length}문제 중 ${solvedCount}문제 해결`;

            // Update the problems section
            problemsSection.innerHTML = problems.map(problem => {
                const isSolved = checkData(problem.id); // solved 상태 확인
                return `
                <div class="problem ${isSolved ? 'solved' : ''}" id="${problem.id}">
                    <h2>${problem.title} ${isSolved ? '(Solved)' : ''}</h2>
                    <p>${problem.id}</p>
                    <div class="action">
                        ${isSolved ? '' : `<button class="action" data-id="${problem.id}">구현</button>`}
                    </div>
                </div>
                `;
            }).join("");

            // Add event listener for action buttons
            const actionButtons = problemsSection.querySelectorAll(".action button");
            actionButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const problemId = button.dataset.id;
                    window.location.href = `./problem/${problemId}.html?data=${encodedData}`;
                });
            });

            // Update progress after changes
            updateProgress();
        });
    });

    // Initial progress update
    updateProgress();
});