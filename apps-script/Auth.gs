const Auth = {
  requireStaffKey(providedKey) {
    if (!providedKey || providedKey !== Config.staffApiKey) {
      const e = new Error('Unauthorized');
      e.statusCode = 403;
      throw e;
    }
  }
};
