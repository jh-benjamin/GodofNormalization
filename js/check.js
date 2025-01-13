export function checkData(problemId) {
    // URL에서 data 파라미터 읽기
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get("data");

    if (dataParam) {
        // data 디코딩
        const solvedProblems = JSON.parse(decodeURIComponent(dataParam));
        console.log(solvedProblems);
        const check = solvedProblems.includes(problemId);
        console.log(check)
        return check;
    }

}