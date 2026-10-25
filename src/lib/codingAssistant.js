export const CODING_MODES = {
  explain: {
    title: "Explain Code",
    instruction: "Explain code in simple Hindi or the user's preferred language. Describe its purpose, important parts, inputs, outputs, and behavior."
  },
  build: {
    title: "Build an App",
    instruction: "Help build the requested app with compatible project files and implementation steps. Preserve existing working features."
  },
  debug: {
    title: "Fix Errors",
    instruction: "Diagnose the supplied error using the code and logs. Explain the likely cause and provide a targeted fix."
  },
  improve: {
    title: "Improve Code",
    instruction: "Improve readability, maintainability, performance, and security where relevant. Preserve behavior unless changes are requested."
  },
  test: {
    title: "Test Code",
    instruction: "Create tests for normal cases, edge cases, and failures. Clearly distinguish tests that actually ran from tests merely proposed."
  },
  stepBuilder: {
    title: "Step-by-Step Builder",
    instruction: "Divide the project into ordered stages. Track progress and give the next actionable implementation step."
  }
};

export function buildCodingRequest({ mode = "explain", request = "", code = "", error = "" } = {}) {
  const selected = CODING_MODES[mode];
  if (!selected) throw new Error("Unknown coding mode: " + mode);

  const sections = [
    selected.instruction,
    request.trim() ? "USER REQUEST:\n" + request.trim() : "",
    code.trim() ? "CODE:\n" + code.trim() : "",
    error.trim() ? "ERROR OR LOGS:\n" + error.trim() : ""
  ].filter(Boolean);

  return {
    mode,
    title: selected.title,
    prompt: sections.join("\n\n")
  };
}
