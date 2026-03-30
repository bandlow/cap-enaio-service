using {cuid} from '@sap/cds/common';


service EnaioService {
  @restrict: [{
    grant: ['READ'],
    to   : 'Display'
  } // nur Benutzer mit Rolle "Display" dürfen lesen
  ]

  //annotate EnaioService.ServiceInfo with @requires: 'Display';
  /// Healthcheck: prüft nur den Tunnel und die Base-URL (kein Service-spezifischer Pfad)
  function PingOnPrem()  returns String;

  /// Liefert die Antwort von /osrest/api/serviceinfo als String (rohe JSON-Payload)
  function ServiceInfo() returns String;

 entity DebugDestination {
  key name: String;
  raw: LargeString;  // Für komplettes JSON
}
}
