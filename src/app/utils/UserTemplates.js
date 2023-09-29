export const loadUserTemplates = (username) => {
    const templateEntryName = `blurtPostTemplates-` + username;
    let userTemplates = localStorage.getItem(templateEntryName);
    if (userTemplates) {
        userTemplates = JSON.parse(userTemplates);
    } else {
        userTemplates = [];
    }

    return userTemplates;
};

export const saveUserTemplates = (username, templates) => {
    const templateEntryName = `blurtPostTemplates-` + username;
    localStorage.setItem(templateEntryName, JSON.stringify(templates));
};
