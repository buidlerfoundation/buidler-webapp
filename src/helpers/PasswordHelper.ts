export const passwordRules = () => {
  return [
    { label: 'At least 8 characters', regex: /^.{8,}$/, isRequired: false },
    {
      label: 'Case sensitive',
      regex: /(?=.*[A-Z])(.*[a-z].*)/,
      isRequired: false,
    },
    { label: 'Number', regex: /(?=.*\d)/, isRequired: false },
    { label: 'Special character', regex: /(?=.*\W)/, isRequired: false },
  ];
};
