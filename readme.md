# FIRST Sheets Query

## Query Parameters

### Param 1 - Team Number - the team number to query
  - ex. `=FRCTEAMINFO(321, "Nickname")` - queries the nickname for the team 321

### Param 2 - Labels/properties - properties to display in a row/column
  Available labels: `CountryCode, ProfileYear, ProgramType, ProgramName, ProgramNameFull, City, Country, FullName, Nickname, TeamNumber, PostalCode, RookieYear, StateProvince`
  - ex. `=FRCTEAMINFO(321, "FullName")` will display 1 cell of the full name of 321
  - ex. `=FRCTEAMINFO(321, {"FullName", "City", "Country"})` will display 3 cells horizontally, with the properties, team full name, team city, team country respectively

### Param 3 - Options/flags - Options in the form of flags `--key=value`
  Available flags: 
  - `horizontal` (default: `true`) - `true/false` - whether the cells for multiple team information will be displayed horizontally or vertically
  - `year` (default: `latest`) - the year/season to get the team information from  
ex. `=FRCTEAMINFO(321, {"Nickname", "CountryCode"}, "--horizontal=false --year=2023")` displays 321's nickname & country code from the year 2023 vertically  
ex. `=FRCTEAMINFO(321, {"Nickname", "CountryCode"}, "--year=2022")` displays 321's nickname & country code from the year 2022 horizontally (default)
