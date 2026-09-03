export default {
  extends: [],
  rules: {},
  parserPreset: {
    parserOpts: { headerPattern: /^(\w+)(?:\(([^)]+)\))?: (.+)$/, headerCorrespondence: ["type", "scope", "subject"] },
  },
};
