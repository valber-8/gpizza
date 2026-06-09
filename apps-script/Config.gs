const Config = {
  get spreadsheetId()  { return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'); },
  get staffApiKey()    { return PropertiesService.getScriptProperties().getProperty('STAFF_API_KEY'); },
  get fcmProjectId()   { return PropertiesService.getScriptProperties().getProperty('FCM_PROJECT_ID')   || ''; },
  get fcmClientEmail() { return PropertiesService.getScriptProperties().getProperty('FCM_CLIENT_EMAIL') || ''; },
  get fcmPrivateKey()  { return PropertiesService.getScriptProperties().getProperty('FCM_PRIVATE_KEY')  || ''; },
  get tasksListPrefix() { return 'Orders — '; },
  get timezone()       { return 'America/Sao_Paulo'; },
};
