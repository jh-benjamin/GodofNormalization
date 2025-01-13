// 현재 URL에서 data 파라미터 가져오기
const currentUrl = new URL(window.location.href);
const encodedData = currentUrl.searchParams.get("data") || "[]"; // 기본값: 빈 배열
let data = JSON.parse(decodeURIComponent(encodedData)); // 디코딩 후 JSON 파싱
console.log("현재 data:", data);

// Pyodide 초기화
const pyodideReadyPromise = loadPyodide();

document.getElementById("submit-btn").addEventListener("click", async () => {
    try {
        const pyodide = await pyodideReadyPromise;

        // Micropip 로드
        await pyodide.loadPackage("micropip");

        // .whl 파일 설치
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install("./bin/changlang_package-1.0.3-py3-none-any.whl")
            await micropip.install("./bin/mll_package-1.0.3-py3-none-any.whl")
        `);

        // 사용자 선택 언어 가져오기
        const selectedLanguage = document.getElementById("language").value; // MLL or CL

        // 사용자 코드 가져오기
        const userCode = document.getElementById("code").value;
        // 현재 URL에서 id 파라미터 가져오기
        const problemId = new URL(window.location.href).searchParams.get("id") || "defaultId"; // 기본값 설정
        console.log("현재 문제 ID:", problemId);

        // 예상 출력 가져오기
        const responseOutput = await fetch(`./answer/${problemId}.txt`);
        if (!responseOutput.ok) {
            throw new Error(`정답 파일을 불러오는 데 실패했습니다: ${responseOutput.statusText}`);
        }
        const expectedOutput = (await responseOutput.text()).trim();

        // console.log("예상 기대값:", expectedOutput)
        // 입력값 가져오기 (입력 파일이 없으면 빈 배열로 처리)
        let inputs = [];
        try {
            const responseInput = await fetch(`./input/${problemId}.txt`);
            if (responseInput.ok) {
                const inputText = await responseInput.text();
                inputs = inputText.split('\n').filter(line => line.trim() !== ""); // 빈 줄 제거
            }
        } catch (err) {
            console.warn("입력 파일이 존재하지 않습니다. 빈 입력으로 진행합니다.");
        }
        // console.log(inputs)
        // console.log(selectedLanguage)

        // Pyodide에서 선택 언어별 interpreter 실행
        const result = await pyodide.runPythonAsync(`
            import json

            # 선택 언어 처리
            if "${selectedLanguage}" == "CL":
                from changlang_package.runtime import ChangLang
                interpreter = ChangLang()
            elif "${selectedLanguage}" == "MLL":
                from mll_package.run import MLL
                interpreter = MLL()
            else:
                raise ValueError("지원하지 않는 언어입니다: " + "${selectedLanguage}")

            # 테스트 실행
            success, actual_output = interpreter.test(
                """${userCode.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, '\\n')}""",
                inputs=${JSON.stringify(inputs)},
                expected_output="""${expectedOutput.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, '\\n')}"""
            )
            json.dumps({"success": success, "actual_output": actual_output})
        `);

        const parsedResult = JSON.parse(result); // JSON 문자열을 JavaScript 객체로 변환

        console.log("Python 반환 결과", parsedResult);

        // 결과 출력
        const { success, actual_output: actualOutput } = parsedResult;

        if (success) {
            alert("정답입니다!");

            // 정답일 경우 data 배열에 현재 problemId 추가
            if (!data.includes(problemId)) {
                data.push(problemId);
            }

            // data를 다시 인코딩하여 index.html로 리다이렉트
            const updatedData = encodeURIComponent(JSON.stringify(data));
            window.location.href = `index.html?data=${updatedData}`;
        } else {
            alert(`틀렸습니다. 실제 출력: ${actualOutput}`);
        }
    } catch (error) {
        console.error(error);
        alert(`오류 발생:\n${error.message}`);
    }
});