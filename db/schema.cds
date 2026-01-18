namespace enaio.test;

entity Documents {
  key ID : UUID;
  title : String;
  documentType : String;
  uploadDate : DateTime;
}
