# Baro.ai - AI Features Documentation

> **Note**: This document is auto-generated from source code (`services/prompts.ts`). Do not edit manually.

Last Updated: 11/25/2025, 8:46:47 PM

---

## Table of Contents
- [스마트 업무 초안 (Smart Draft)](#drafttask)
- [전략 분석 (Strategy Analysis)](#analyzetask)
- [하위 업무 생성 (Subtask Breakdown)](#generatesubtasks)
- [완료 조건 생성 (DoD Generator)](#generateacceptancecriteria)
- [솔루션 초안 작성 (Solution Draft)](#generatesolutiondraft)
- [학습 자료 추천 (Resource Recommender)](#recommendresources)
- [AI 가이드 시스템 프롬프트](#chatguidesystem)
- [팀 인사이트 분석 (Team Insights)](#generateinsights)
- [지식 리소스 심층 분석 (Deep Resource Analysis)](#analyzeknowledgeresource)

---

## 스마트 업무 초안 (Smart Draft) <a id="drafttask"></a>

- **ID**: `draftTask`
- **Model**: `gemini-pro`
- **Tags**: `Creation`, `Drafting`
- **Description**: 사용자의 거친 아이디어를 분석하여 표준, 상세, 간결 등 3가지 스타일의 전문적인 업무 명세서를 제안합니다.

### Prompt Logic

```javascript
rawInput=>`
      \uB2F9\uC2E0\uC740 IT \uC120\uB3C4 \uAE30\uC5C5\uC758 \uC218\uC11D PM(Project Manager)\uC785\uB2C8\uB2E4.
      \uC0AC\uC6A9\uC790\uAC00 \uC785\uB825\uD55C \uAC70\uCE5C(Rough) \uC5C5\uBB34 \uC544\uC774\uB514\uC5B4\uB97C \uBD84\uC11D\uD558\uC5EC, \uAC1C\uBC1C\uD300\uC774\uB098 \uB514\uC790\uC778\uD300\uC774 \uC989\uC2DC \uCC29\uC218\uD560 \uC218 \uC788\uB294 "\uC804\uBB38\uC801\uC778 \uC5C5\uBB34 \uBA85\uC138\uC11C" \uCD08\uC548\uC744 3\uAC00\uC9C0 \uC2A4\uD0C0\uC77C\uB85C \uC81C\uC548\uD558\uC138\uC694.

      [\uC785\uB825 \uBA54\uC2DC\uC9C0]
      "${rawInput}"
      
      [\uC791\uC131 \uC9C0\uCE68]
      \uB2E4\uC74C 3\uAC00\uC9C0 \uC2A4\uD0C0\uC77C\uC758 \uC635\uC158\uC744 \uD3EC\uD568\uD55C \uB9AC\uC2A4\uD2B8\uB97C \uC0DD\uC131\uD558\uC138\uC694:
      1. "\uD45C\uC900(Standard)": \uADE0\uD615 \uC7A1\uD78C \uC804\uBB38\uC801\uC778 \uC2A4\uD0C0\uC77C.
      2. "\uC0C1\uC138(Detailed)": \uBC30\uACBD, \uC0C1\uC138 \uC694\uAC74, \uAE30\uB300 \uD6A8\uACFC \uB4F1\uC744 \uB9E4\uC6B0 \uAD6C\uCCB4\uC801\uC73C\uB85C \uAE30\uC220.
      3. "\uAC04\uACB0(Concise)": \uD575\uC2EC\uB9CC \uBE60\uB974\uAC8C \uD30C\uC545\uD560 \uC218 \uC788\uB294 \uC694\uC57D \uC2A4\uD0C0\uC77C.

      \uAC01 \uD56D\uBAA9\uC740 \uB2E4\uC74C \uD544\uB4DC\uB97C \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4:
      - title: \uBA85\uD655\uD558\uACE0 \uC804\uBB38\uC801\uC778 \uC81C\uBAA9 (\uD55C\uAD6D\uC5B4)
      - description: \uC2A4\uD0C0\uC77C(\uD45C\uC900/\uC0C1\uC138/\uAC04\uACB0)\uC5D0 \uB9DE\uCD98 \uC0C1\uC138 \uC124\uBA85 (\uD55C\uAD6D\uC5B4, \uC904\uBC14\uAFC8 \uD3EC\uD568)
      - priority: 'HIGH', 'MEDIUM', 'LOW' \uC911 \uD0DD1
      - product: \uC81C\uD488\uAD70 \uCD94\uB860
      - type: \uC5C5\uBB34 \uC720\uD615 (\uBC84\uADF8, \uAE30\uB2A5, UX \uB4F1)
      - styleTag: "\uD45C\uC900", "\uC0C1\uC138", "\uAC04\uACB0" \uC911 \uD558\uB098

      \uC751\uB2F5\uC740 JSON \uBC30\uC5F4(Array)\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.
    `
```

---

## 전략 분석 (Strategy Analysis) <a id="analyzetask"></a>

- **ID**: `analyzeTask`
- **Model**: `gemini-pro`
- **Tags**: `Analysis`, `Strategy`
- **Description**: 업무의 핵심 맥락을 분석하고, 실행을 위한 단계별 가이드와 예상 리스크를 도출합니다.

### Prompt Logic

```javascript
task=>`
      \uB2F9\uC2E0\uC740 \uC2DC\uB2C8\uC5B4 \uD504\uB85C\uC81D\uD2B8 \uB9E4\uB2C8\uC800\uC774\uC790 \uAE30\uC220 \uD29C\uD130\uC785\uB2C8\uB2E4.
      \uB2E4\uC74C \uC5C5\uBB34\uB97C \uBD84\uC11D\uD558\uC5EC \uC2E4\uBB34\uC790\uAC00 **\uAC00\uC7A5 \uBA3C\uC800 \uD30C\uC545\uD574\uC57C \uD560 \uD575\uC2EC \uC9C0\uC2DD(Context)**\uACFC **\uAD6C\uCCB4\uC801\uC778 \uC2E4\uD589 \uC804\uB7B5**\uC744 \uC81C\uC2DC\uD558\uC138\uC694.

      [\uC5C5\uBB34 \uC815\uBCF4]
      \uC81C\uBAA9: ${task.title}
      \uC81C\uD488: ${task.product}
      \uC124\uBA85: ${task.description}
      
      [\uC694\uCCAD \uC0AC\uD56D]
      1. strategy \uD544\uB4DC\uC5D0\uB294 \uB2E4\uC74C \uB0B4\uC6A9\uC744 \uB9C8\uD06C\uB2E4\uC6B4 \uD615\uC2DD\uC73C\uB85C \uC791\uC131\uD558\uC138\uC694:
         - \u{1F9D0} **\uD575\uC2EC \uD30C\uC545 \uC0AC\uD56D**: \uC774 \uC5C5\uBB34\uB97C \uC2DC\uC791\uD558\uAE30 \uC804 \uBC18\uB4DC\uC2DC \uC54C\uC544\uC57C \uD560 \uAC1C\uB150, \uAE30\uC220 \uC2A4\uD0DD, \uD639\uC740 \uBE44\uC988\uB2C8\uC2A4 \uB9E5\uB77D. (1\uCC28\uC801\uC73C\uB85C \uBB34\uC5C7\uC744 \uC54C\uC544\uC57C \uD558\uB294\uC9C0)
         - \u{1F680} **\uB2E8\uACC4\uBCC4 \uC2E4\uD589 \uAC00\uC774\uB4DC**: \uAD6C\uCCB4\uC801\uC778 Action Item \uAE30\uBC18\uC758 \uC804\uB7B5.
         - \u{1F4A1} **\uC131\uACF5 \uD301**: \uC608\uC0C1\uB418\uB294 \uC5B4\uB824\uC6C0\uC774\uB098 \uD6A8\uC728\uC131\uC744 \uB192\uC774\uB294 \uD301.
         - \u26A0\uFE0F **\uB9AC\uC2A4\uD06C \uC694\uC778**: \uBC1C\uC0DD \uAC00\uB2A5\uD55C \uC7A0\uC7AC\uC801 \uBB38\uC81C\uC640 \uB300\uC751 \uBC29\uC548.
      
      2. suggestedResources \uD544\uB4DC\uC5D0\uB294 \uC5C5\uBB34\uC640 \uAD00\uB828\uB41C \uC591\uC9C8\uC758 \uD559\uC2B5 \uC790\uB8CC(\uBB38\uC11C, \uBE14\uB85C\uADF8 \uB4F1) 2\uAC1C\uB97C \uCD94\uCC9C\uD558\uC138\uC694.
      
      \uBAA8\uB4E0 \uC751\uB2F5\uC740 "\uD55C\uAD6D\uC5B4"\uB85C \uC791\uC131\uD574\uC8FC\uC138\uC694.
    `
```

---

## 하위 업무 생성 (Subtask Breakdown) <a id="generatesubtasks"></a>

- **ID**: `generateSubtasks`
- **Model**: `gemini-pro`
- **Tags**: `Planning`, `Breakdown`
- **Description**: 하나의 큰 업무를 실행 가능한 단위의 체크리스트(4~6개)로 자동 분해합니다.

### Prompt Logic

```javascript
task=>`
      \uB2E4\uC74C \uC5C5\uBB34\uB97C 4-6\uAC1C\uC758 \uC2E4\uD589 \uAC00\uB2A5\uD55C \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \uD56D\uBAA9(\uD558\uC704 \uC5C5\uBB34)\uC73C\uB85C \uBD84\uD574\uD574\uC8FC\uC138\uC694.
      \uC5C5\uBB34: ${task.title}
      \uBB38\uB9E5: ${task.description}
      \uC751\uB2F5\uC740 \uD55C\uAD6D\uC5B4 JSON \uBC30\uC5F4\uC785\uB2C8\uB2E4.
    `
```

---

## 완료 조건 생성 (DoD Generator) <a id="generateacceptancecriteria"></a>

- **ID**: `generateAcceptanceCriteria`
- **Model**: `gemini-pro`
- **Tags**: `QA`, `Validation`
- **Description**: QA 및 배포를 위해 업무가 충족해야 할 구체적인 검증 기준(DoD)을 생성합니다.

### Prompt Logic

```javascript
task=>`
      \uB2E4\uC74C \uC5C5\uBB34\uAC00 QA\uB97C \uD1B5\uACFC\uD558\uACE0 \uBC30\uD3EC\uB418\uAE30 \uC704\uD55C '\uC644\uB8CC \uC870\uAC74(Acceptance Criteria)'\uC744 \uBD88\uB81B \uD3EC\uC778\uD2B8 \uB9AC\uC2A4\uD2B8\uB85C \uC791\uC131\uD574\uC8FC\uC138\uC694.
      
      [\uC5C5\uBB34 \uC815\uBCF4]
      \uC81C\uBAA9: ${task.title}
      \uC124\uBA85: ${task.description}
      
      \uC751\uB2F5\uC740 \uD55C\uAD6D\uC5B4 \uBB38\uC790\uC5F4 \uBC30\uC5F4(JSON Array of strings)\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.
    `
```

---

## 솔루션 초안 작성 (Solution Draft) <a id="generatesolutiondraft"></a>

- **ID**: `generateSolutionDraft`
- **Model**: `gemini-pro`
- **Tags**: `Engineering`, `Solution`
- **Description**: 기능 구현을 위한 기술적인 접근 방식, 코드 스니펫 또는 문서 초안을 마크다운으로 작성합니다.

### Prompt Logic

```javascript
task=>`
      \uB2F9\uC2E0\uC740 \uC218\uC11D \uC5D4\uC9C0\uB2C8\uC5B4\uC785\uB2C8\uB2E4. \uB2E4\uC74C \uC5C5\uBB34\uB97C \uAD6C\uD604\uD558\uAE30 \uC704\uD55C \uAE30\uC220\uC801\uC778 \uC194\uB8E8\uC158 \uCD08\uC548\uC744 \uB9C8\uD06C\uB2E4\uC6B4 \uD615\uC2DD\uC73C\uB85C \uC791\uC131\uD574\uC8FC\uC138\uC694.
      \uD544\uC694\uD558\uB2E4\uBA74 \uCF54\uB4DC \uC2A4\uB2C8\uD3AB(Code Snippet)\uC774\uB098 \uC544\uD0A4\uD14D\uCC98 \uC124\uBA85\uC744 \uD3EC\uD568\uD558\uC138\uC694.
      
      [\uC5C5\uBB34 \uC815\uBCF4]
      \uC81C\uBAA9: ${task.title}
      \uC124\uBA85: ${task.description}
      \uAE30\uC220 \uC2A4\uD0DD: React, TypeScript, Tailwind CSS
      
      \uC751\uB2F5\uC740 \uB9C8\uD06C\uB2E4\uC6B4 \uD14D\uC2A4\uD2B8\uB85C\uB9CC \uC791\uC131\uD574\uC8FC\uC138\uC694.
    `
```

---

## 학습 자료 추천 (Resource Recommender) <a id="recommendresources"></a>

- **ID**: `recommendResources`
- **Model**: `gemini-pro`
- **Tags**: `Learning`, `Research`
- **Description**: 업무 해결에 도움이 되는 최신 기술 문서, 블로그, 튜토리얼 링크를 추천합니다.

### Prompt Logic

```javascript
task=>`
      \uB2E4\uC74C \uC5C5\uBB34\uC640 \uAD00\uB828\uB41C \uC591\uC9C8\uC758 \uD559\uC2B5 \uC790\uB8CC(\uAE30\uC220 \uBB38\uC11C, \uACF5\uC2DD \uAC00\uC774\uB4DC, \uD29C\uD1A0\uB9AC\uC5BC) 3\uAC00\uC9C0\uB97C \uCD94\uCC9C\uD574\uC8FC\uC138\uC694.
      
      [\uC5C5\uBB34 \uC815\uBCF4]
      \uC81C\uBAA9: ${task.title}
      \uC124\uBA85: ${task.description}
      
      \uC751\uB2F5\uC740 \uB2E4\uC74C \uD544\uB4DC\uB97C \uAC00\uC9C4 JSON \uBC30\uC5F4\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4:
      - title: \uC790\uB8CC \uC81C\uBAA9
      - url: \uB9C1\uD06C (\uC2E4\uC81C \uC874\uC7AC\uD558\uB294 URL\uC774\uAC70\uB098 \uAC80\uC0C9 \uAC00\uB2A5\uD55C \uD0A4\uC6CC\uB4DC \uAE30\uBC18\uC758 \uAC00\uC0C1\uC758 URL)
      - description: \uCD94\uCC9C \uC774\uC720 (\uD55C \uC904 \uC694\uC57D)
    `
```

---

## AI 가이드 시스템 프롬프트 <a id="chatguidesystem"></a>

- **ID**: `chatGuideSystem`
- **Model**: `gemini-pro`
- **Tags**: `Chat`, `System`
- **Description**: 업무 컨텍스트를 기반으로 사용자 질문에 답변하는 AI 어시스턴트의 페르소나를 정의합니다.

### Prompt Logic

```javascript
contextTask=>`System: \uB2F9\uC2E0\uC740 \uB2E4\uC74C \uC5C5\uBB34\uB97C \uB3D5\uB294 \uCE5C\uC808\uD55C \uC5B4\uC2DC\uC2A4\uD134\uD2B8\uC785\uB2C8\uB2E4. \uC81C\uBAA9: ${contextTask.title}, \uC124\uBA85: ${contextTask.description}. \uB2F5\uBCC0\uC740 \uD55C\uAD6D\uC5B4\uB85C \uC791\uC131\uD558\uC138\uC694.`
```

---

## 팀 인사이트 분석 (Team Insights) <a id="generateinsights"></a>

- **ID**: `generateInsights`
- **Model**: `gemini-pro`
- **Tags**: `Analytics`, `Reporting`
- **Description**: 전체 프로젝트 데이터를 분석하여 KPI 지표와 함께 주간 핵심 인사이트 리포트를 생성합니다.

### Prompt Logic

```javascript
(tasks,teamStats)=>`
      \uB2F9\uC2E0\uC740 \uB370\uC774\uD130 \uAE30\uBC18\uC73C\uB85C \uD300\uC758 \uC131\uACFC\uB97C \uBD84\uC11D\uD558\uB294 AI \uC804\uBB38\uAC00\uC785\uB2C8\uB2E4.
      \uC544\uB798 \uC81C\uACF5\uB41C \uD504\uB85C\uC81D\uD2B8 \uB370\uC774\uD130\uB97C \uBD84\uC11D\uD558\uC5EC, \uD300 \uB9AC\uB354\uC5D0\uAC8C \uC81C\uACF5\uD560 **\uC8FC\uAC04 \uD575\uC2EC \uC778\uC0AC\uC774\uD2B8**\uB97C 2~3\uBB38\uC7A5\uC73C\uB85C \uC694\uC57D\uD574 \uC8FC\uC138\uC694.

      [\uB370\uC774\uD130]
      - \uC804\uCCB4 \uC5C5\uBB34 \uC218: ${teamStats.total}
      - \uC644\uB8CC\uC728: ${teamStats.completionRate}%
      - \uC9C4\uD589 \uC911 \uC5C5\uBB34: ${teamStats.inProgress}
      - \uB9C8\uAC10 \uAE30\uD55C \uCD08\uACFC: ${teamStats.overdue}
      - \uC5C5\uBB34\uAC00 \uAC00\uC7A5 \uB9CE\uC740 \uD300\uC6D0: ${teamStats.busiestMember}
      
      [\uBD84\uC11D \uC9C0\uCE68]
      1. \uD604\uC7AC \uD300\uC758 **\uAE0D\uC815\uC801\uC778 \uD750\uB984**\uC744 \uBA3C\uC800 \uC5B8\uAE09\uD558\uC138\uC694 (\uC608: \uC644\uB8CC\uC728\uC774 \uB192\uC74C, \uC9C4\uD589\uC774 \uC6D0\uD65C\uD568).
      2. **\uC8FC\uC758\uAC00 \uD544\uC694\uD55C \uBD80\uBD84**\uC774\uB098 **\uB9AC\uC2A4\uD06C**(\uC608: \uD2B9\uC815 \uC778\uC6D0 \uACFC\uBD80\uD558, \uB9C8\uAC10 \uCD08\uACFC)\uB97C \uBD80\uB4DC\uB7FD\uAC8C \uC9C0\uC801\uD558\uC138\uC694.
      3. \uAD6C\uCCB4\uC801\uC778 **\uC561\uC158 \uC544\uC774\uD15C**\uC744 \uD558\uB098 \uC81C\uC548\uD558\uC138\uC694.
      4. \uC5B4\uC870\uB294 \uC804\uBB38\uC801\uC774\uBA74\uC11C\uB3C4 \uACA9\uB824\uD558\uB294 \uD1A4\uC73C\uB85C \uC791\uC131\uD558\uC138\uC694.
      5. \uB2F5\uBCC0\uC740 JSON\uC774 \uC544\uB2CC **\uC77C\uBC18 \uD14D\uC2A4\uD2B8(String)**\uB85C \uC8FC\uC138\uC694.
    `
```

---

## 지식 리소스 심층 분석 (Deep Resource Analysis) <a id="analyzeknowledgeresource"></a>

- **ID**: `analyzeKnowledgeResource`
- **Model**: `gemini-2.0-flash`
- **Tags**: `Knowledge`, `Analysis`, `Search`
- **Description**: URL, 비디오, 문서 등의 지식 자원을 분석하여 요약, 핵심 포인트, 챕터 정보 등을 구조화된 JSON으로 추출합니다.

### Prompt Logic

```javascript
url=>`
      Analyze the content of the following URL: ${url}
      
      If it's a video (like YouTube), treat it as video content.
      If it's an article, treat it as text content.

      Return a SINGLE JSON object (not an array) with the following structure (Korean):
      {
          "title": "Exact title of the content",
          "summary": "3-line summary in Korean",
          "tags": ["tag1", "tag2", "tag3"],
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "keyPoints": ["Key takeaway 1", "Key takeaway 2"],
          "chapters": [
              { "timestamp": "00:00", "title": "Intro", "summary": "Brief explanation" } 
          ]
      }
    `
```

---

