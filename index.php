<?php

$consent_data = array(
  array(
    'cat' => 'analytics',
    'cat_label' => 'Analyse',
    'items' => array(
      array(
        'type' => 'script-src',
        'position' => 'header',
        'code' => 'http://localhost/cookie-related-popup/test/testing.js'
      ),
      array(
        'type' => 'script-content',
        'position' => 'header',
        'code' => "console.log( 'hello from inline script' );"
      ),
      array(
        'type' => 'html',
        'code' => '<div class="container py-3">Hello, I’m consent-related <span style="background: #fc3;">HTML-content</span>.</div>'
      )
    )
  ),
  array(
    'cat' => 'other-category',
    'cat_label' => 'Other category',
    'items' => array(
      array(
        'type' => 'script-src',
        'position' => 'header',
        'code' => 'http://localhost/cookie-related-popup/test/testing-2.js'
      ),
      array(
        'type' => 'script-content',
        'position' => 'header',
        'code' => "console.log( 'hello from inline script 2' );"
      )
    )
  ),
  array(
    'cat' => 'empty-category',
    'cat_label' => 'Empty category'
  )
);


class Consent_Popup_Manager {

  public $data;

  function __construct( $data ) {
    $this->data = $data;
  }

  private function consentApplyScriptBySrc( $cat, $src, $pos = 'footer' ) {
    echo '<div data-tg="data-processing-consent-content" data-category="' . $cat . '" data-position="' . $pos . '" data-script-src="' . $src . '" aria-hidden="true"></div>' . "\n";
  }

  private function consentApplyScriptByContent( $cat, $content, $pos = 'footer' ) {
    echo '<div data-tg="data-processing-consent-content" data-category="' . $cat . '" data-position="' . $pos . '" data-script-content="' . htmlspecialchars( $content ) . '" aria-hidden="true"></div>' . "\n";
  }

  private function consentApplyHtml( $cat, $html ) {
    echo '<div data-tg="data-processing-consent-content" data-category="' . $cat . '" data-html="' . htmlspecialchars( $html ) . '" aria-hidden="true"></div>' . "\n";
  }

  public function printData() {

    echo '<!-- consent related data (hidden) -->';

    foreach ( $this->data as $cat ) {
      if ( isset( $cat[ 'cat' ] ) && isset( $cat[ 'cat_label' ] ) && isset( $cat[ 'items' ] ) && sizeof( $cat[ 'items' ] ) > 0 ) {
        foreach ( $cat[ 'items' ] as $item ) {
          if ( isset( $item[ 'type' ] ) &&  isset( $item[ 'code' ] ) ) {
            if ( $item[ 'type' ] == 'script-src' ) {
              echo $this->consentApplyScriptBySrc( $cat[ 'cat' ], $item[ 'code' ], $item[ 'position' ] );
            }
            elseif ( $item[ 'type' ] == 'script-content' ) {
              echo $this->consentApplyScriptByContent( $cat[ 'cat' ], $item[ 'code' ], $item[ 'position' ] );
            }
            elseif ( $item[ 'type' ] == 'html' ) {
              echo $this->consentApplyHtml( $cat[ 'cat' ], $item[ 'code' ] );
            }
          }
        }
      }
    }
  }

  public function printCheckboxes() {

    echo '<!-- consent checkboxes -->';

    foreach ( $this->data as $cat ) {
      if ( isset( $cat[ 'cat' ] ) && isset( $cat[ 'cat_label' ] ) ) {
        echo 
          '<div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="data-processing-consent-' . $cat[ 'cat' ] . '" value="' . $cat[ 'cat' ] . '" data-g-tg="category-input">
            <label class="form-check-label" for="data-processing-consent-' . $cat[ 'cat' ] . '">' . $cat[ 'cat_label' ] . '</label>
          </div>';
      }
    }
  }

  public static function printPopupTrigger() {
    echo 
      '<!-- button showing consent popup -->
        <button class="btn btn-primary" id="consent-popup-trigger" aria-haspopup="true" aria-controls="consent-popup" aria-expanded="false" data-fn="data-processing-popup-trigger">Cookie-Einstellungen ansehen/ändern</button>';
  }

  public function printHtml( $cat, $html ) {

    // TODO: add cat if not existing

    echo '<!-- consent html -->';

    echo $this->consentApplyHtml( $cat, $html );
  }

}


$consent_popup_manager = new Consent_Popup_Manager( $consent_data );


/*
  <!-- button showing consent popup -->
  <button class="btn btn-primary" id="consent-popup-trigger" aria-haspopup="true" aria-controls="consent-popup" aria-expanded="false" data-fn="data-processing-popup-trigger">Cookie-Einstellungen ansehen/ändern</button>
*/
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cookie related popup</title>

    <link rel="preload" href="assets/css/style.css" as="style">
    <link href="assets/css/style.css" rel="stylesheet">

  </head>
  <body>

    <div class="container">

      <h1>Cookie related popup</h1>

      <p>Find below a popup which is used to get the user’s dada processing consent. The popup is shown if it hasn’t already been closed by the user. The opening or closing status is saved in a cookie. The consent status for each data processing category is savend in another cookie, too.</p>



      <!-- button to show consent popup -->
      <button class="btn btn-primary" id="consent-popup-trigger" aria-controls="consent-popup" aria-expanded="false" data-fn="data-processing-popup-trigger">Show consent banner</button>

    </div>


    <!-- consent popup -->    
    <div class="fixed-banner fixed-banner-bottom fixed-banner-closable bg-secondary d-none" id="consent-popup" aria-labeledby="consent-popup-trigger" tabindex="-1" role="dialog" hidden data-fn="cookie-related-elem" data-tg="data-processing-popup" data-fn-options="{ cookieName: 'dataProcessingConsentBannerHidden', cookieExpiresDays: 365, hiddenCookieValue: '1', hiddenClass: 'd-none', remoteOpenable: true }">
          
      <div class="container py-3">
        
        <form data-fn="data-processing-form" data-fn-options="{ cookieName: 'dataProcessingConsent', cookieExpiresDays: 365, categoryInputSelector: '[data-g-tg=category-input]' }">
          <div class="form-row align-items-center">

            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="data-processing-consent-essential" value="essential" checked disabled data-g-tg="category-input">
              <label class="form-check-label" for="data-processing-consent-essential">Essential</label>
            </div>

            <?php
              $consent_popup_manager->printCheckboxes();
            ?>

            <!--
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="data-processing-consent-0-0" value="analytics" data-g-tg="category-input">
              <label class="form-check-label" for="data-processing-consent-0-0">Analytics</label>
            </div>

            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="data-processing-consent-1-0" value="other-category" data-g-tg="category-input">
              <label class="form-check-label" for="data-processing-consent-1-0">Other category</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="data-processing-consent-2-0" value="google-maps" data-g-tg="category-input">
              <label class="form-check-label" for="data-processing-consent-2-0">Google Maps</label>
            </div>
            -->

            <div class="col-auto">
              <button class="btn btn-outline-primary btn-sm" type="submit" data-fn="cookie-related-elem-close" data-g-fn="save">Save</button>
            </div>

            <div class="col-auto">
              <button class="btn btn-primary btn-sm" data-fn="cookie-related-elem-close" data-g-fn="allow-all">Allow all</button>
            </div>

          </div>
        </form>
        
      </div>
      
    </div>

    <?php
      // build consent data
      $consent_popup_manager->printData();
    ?>
    

    <!-- <script type="text/x-template" data-category="analytics" data-position="header" src="http://localhost/cookie-related-popup/test/testing.js"></script>
    <script type="text/x-template" data-category="analytics" data-position="header">
      console.log( 'hello from inline script' );
    </script> -->
    
    <!-- <script type="text/x-template" data-category="other-category" src="http://localhost/cookie-related-popup/test/testing-2.js"></script>
    <script type="text/x-template" data-category="other-category">
      console.log( 'hello from inline script 2' );
    </script> -->

    <!--
    <script type="text/x-template" data-category="google-maps" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA21GpZ60Dj5vybj2nAN0ZqZcqgLDG4y9E
    &callback=initMap&libraries=&v=weekly"
          defer></script>
    <script type="text/x-template" data-category="google-maps">

    // Initialize and add the map
    function initMap() {

      // location
      var mapLocation = { lat: 53.54136, lng: 9.98418 };

      // map, centered at location
      var map = new google.maps.Map(document.getElementById("example-map"), {
        zoom: 17,
        center: mapLocation,
      });

      // marker, positioned at location
      var contentString = '<div class="text-primary font-weight-bold">Elbphilharmonie</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString,
      });

      // marker, positioned at location
      var marker = new google.maps.Marker({
        position: mapLocation,
        map: map,
      });

      // open infowindow initial
      infowindow.open(map, marker);

      // open on click
      marker.addListener("click", function() {
        infowindow.open(map, marker);
      });
    }
    </script>
  -->

    <!--
    <button class="btn btn-primary" data-fn="data-processing-cat-consent-trigger" data-fn-options="{ cat: 'other-category' }">Allow “Other category”</button>
    <button class="btn btn-primary" data-fn="data-processing-cat-consent-trigger" data-fn-options="{ cat: 'analytics' }">Allow “Analytics”</button>
    <button class="btn btn-primary test-hello" data-fn="data-processing-cat-consent-trigger" data-fn-options="{ cat: 'google-maps', consentClass: 'd-none', nonConsentClass: 'test-hello' }">Allow “Google Maps”</button>

    <div class="bsx-clickable-overlay-wrapper">
      <div id="example-map" style="height: 400px;"></div>
      <div class="bsx-clickable-overlay" data-g-tg="consent-trigger-wrapper">
        <button class="btn btn-outline-light" data-fn="data-processing-cat-consent-trigger" data-fn-options="{ cat: 'google-maps', consentClass: 'd-none', classTarget: '[data-g-tg=consent-trigger-wrapper]' }">Clicken um Google Maps zu laden</button>
      </div>
    </div>
    -->


    <script src="./assets/js/jquery.min.js"></script>
    <script src="./assets/js/scripts.js"></script>
  </body>
</html>
