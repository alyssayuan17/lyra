export const getAccessToken = async () => {
    const clientId = "7f1c05be580541718393338b885c0167";
    const clientSecret = "1db00d090092465dbc3629ff276a2098";
  
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
  
    const data = await response.json();
    return data.access_token;
};
  