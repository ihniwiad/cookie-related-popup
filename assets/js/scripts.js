var BSX_UTILS = ( function( $ ) {

    var Utils = {
        $document:      $( document ),
        $window:        $( window ),

        $functionElems: null,
        $targetElems: null,

        events: {
            initJs: 'initJs'
        },

        selectors: {
            functionElement:    '[data-fn]',
            targetElement:      '[data-tg]',
            focussableElements: 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        },

        attributes: {
            functionElement:    'data-fn',
            targetElement:      'data-tg',
            options:            'data-fn-options',
        }
        
    };

    // cache all functional elements
    var $functionAndTargetElems = $( Utils.selectors.functionElement + ', ' + Utils.selectors.targetElement );
    Utils.$functionElems = $functionAndTargetElems.filter( Utils.selectors.functionElement );
    Utils.$targetElems = $functionAndTargetElems.filter( Utils.selectors.targetElement );

    // convert type
    function _convertType( value ) {
        try {
            value = JSON.parse( value );
            return value;
        }
        catch( e ) {
            // 'value' is not a json string.
            return value
        }
    }

    // aria expanded
    $.fn.ariaExpanded = function( value ) {
        if ( typeof value !== 'undefined' ) {
            $( this ).attr( 'aria-expanded', value );
            return value;
        }
        return _convertType( $( this ).attr( 'aria-expanded' ) );
    };

    // get options from attribute
    // syntax: data-fn-options="{ focusOnOpen: '[data-tg=\'header-search-input\']', bla: true, foo: 'some text content' }"
    $.fn.getOptionsFromAttr = function() {
        var $this = $( this );
        var options = $this.attr( Utils.attributes.options );
        if ( typeof options !== 'undefined' ) {
            return ( new Function( 'return ' + options ) )();
        }
        else {
            return {};
        }
    }
    // /get options from attribute

    return Utils;
} )( jQuery );



// COOKIE HANDLER

( function( $, Utils ) {

    var CookieHandler = {};

    CookieHandler.setCookie = function( cookieName, cookieValue, expiresDays, path, sameSite ) {
        var date = new Date();
        var sameSiteDefault = 'strict';
        date.setTime( date.getTime() + ( expiresDays * 24 * 60 * 60 * 1000 ) );
        document.cookie = cookieName + '=' + cookieValue + '; ' + 'expires=' + date.toUTCString() + ( !! path ? '; path=' + path : '' ) + '; sameSite=' + ( !! sameSite ? sameSite : sameSiteDefault ) + ( sameSite == 'none' ? '; secure' : '' );
    };

    CookieHandler.getCookie = function( cookieName ) {
        var searchStr = cookieName + '=';
        var cookies = document.cookie.split( ';' );
        for ( var i = 0; i < cookies.length; i++ ) {
            var cookie = cookies[ i ];
            while ( cookie.charAt( 0 ) == ' ' ) {
                cookie = cookie.substring( 1 );
            };
            if ( cookie.indexOf( searchStr ) == 0 ) {
                return cookie.substring( searchStr.length, cookie.length );
            };
        }
        return '';
    };

    // add cookie handler to utils to use global
    Utils.CookieHandler = CookieHandler;

} )( jQuery, BSX_UTILS );



// COOKIE RELATED ELEMENT

( function( $, Utils ) {

    var CookieRelatedElem = {};

    CookieRelatedElem.init = function( elem, options ) {

        var defaults = {
            closeElemSelector: '[data-fn="cookie-related-elem-close"]',
            hiddenCookieValue: '1',
            cookieExpiresDays: 365, 
            cookiePath: '/',
            focusOnOpen: true,
            remoteOpenable: false
        };

        options = $.extend( {}, defaults, options );

        var $elem = $( elem );
        if ( options.focusOnOpen ) {
            CookieRelatedElem.$focussedElem = null;
        }

        $.fn._showElem = function() {

            var $elem = $( this );

            // set trigger aria-expanded
            var id = $elem.attr( 'id' );
            var $triggers = Utils.$functionElems.filter( '[aria-controls="' + id + '"]' );
            if ( $triggers.length > 0 ) {
                $triggers.ariaExpanded( true );
            }

            if ( options.focusOnOpen ) {
                if ( CookieRelatedElem.$focussedElem === null ) {
                    CookieRelatedElem.$focussedElem = $( Utils.$document.activeElement );
                }

                CookieRelatedElem.$focussableChildren = $elem.find( Utils.selectors.focussableElements );
            }

            // open dialog
            $elem.removeClass( options.hiddenClass );

            $elem.removeAttr( 'hidden' );

            // set focus to first focussable elem
            if ( options.focusOnOpen ) {
                CookieRelatedElem.$focussableChildren.first().focus();
            }
        };

        $.fn._hideElem = function() {

            var $elem = $( this );

            // set trigger aria-expanded
            var id = $elem.attr( 'id' );
            var $triggers = Utils.$functionElems.filter( '[aria-controls="' + id + '"]' );
            if ( $triggers.length > 0 ) {
                $triggers.ariaExpanded( false );
            }
            
            if ( !! options.hiddenClass ) {
                $elem.addClass( options.hiddenClass );
            }
            else {
                $elem.hide();
            }

            $elem.attr( 'hidden', '' );

            // set focus back to elem that was focussed before opening dialog
            if ( options.focusOnOpen && !! CookieRelatedElem.$focussedElem ) {
                CookieRelatedElem.$focussedElem.focus();
                CookieRelatedElem.$focussedElem = null;
            }
        };

        $.fn._bindClose = function() {

            var $currentElem = $( this );
            var $close = $currentElem.find( options.closeElemSelector );

            // bind hide elem & cookie set (if options.remoteOpenable always set close click event to be able to close manually after open remote)
            $close.on( 'click', function() {

                // console.log( 'close clicked' );

                // set cookie, hide elem
                if ( !! options.cookieName && !! options.hiddenCookieValue && !! options.cookieExpiresDays && !! options.cookiePath ) {
                    Utils.CookieHandler.setCookie( options.cookieName, options.hiddenCookieValue, options.cookieExpiresDays, options.cookiePath );

                    $currentElem._hideElem();
                }

            } );
        };



        // check if cookie already set

        // TODO: if following condition is true click handler to close will be missing – apply method to open & close?
        if ( !! options.cookieName && !! Utils.CookieHandler.getCookie( options.cookieName ) && Utils.CookieHandler.getCookie( options.cookieName ) == options.hiddenCookieValue ) {

            // hide elem im visible
            if ( ! $elem.is( '.' + options.hiddenClass ) ) {
                $elem._hideElem();
            }

            if ( options.remoteOpenable ) {

                // bind hide elem & cookie set
                $elem._bindClose();

            }
        }
        else {

            // show elem if hidden
            if ( $elem.is( '.' + options.hiddenClass ) ) {
                $elem._showElem();
            }

            // bind hide elem & cookie set
            $elem._bindClose();
        }

        // remote openable & closable
        if ( options.remoteOpenable ) {

            // open
            $elem.on( 'CookieRelatedElem.open', function() {
                $( this )._showElem();
            } );

            // close
            $elem.on( 'CookieRelatedElem.close', function() {
                $( this )._hideElem();
            } );
        }

    }

    $.fn.initCookieRelatedElem = function() {
        $( this ).each( function( i, elem ) {

            var $elem = $( elem );

            var options = $elem.getOptionsFromAttr();

            return CookieRelatedElem.init( $elem, options );
        } );
    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="cookie-related-elem"]' ).initCookieRelatedElem();

    } );

} )( jQuery, BSX_UTILS );



// DATA PROCESSING CONSENT

( function( $, Utils ) {

    // console.log( 'consent function' )

    /*
        TODO: 
            - copy all (but type!) script attributes (async, etc.) from src scripts (is this really necessary when new script is beeing applied by already runnig script?)
            - (?) option to append to head
    */
    
    var defaultConsentStatus = {
        "cats": []
    };
    var renewCookie = false;
    var showConsentHint = false;
    
    var $consentForm = Utils.$functionElems.filter( '[data-fn="data-processing-form"]' );
    var $consentBanner = Utils.$targetElems.filter( '[data-tg="data-processing-popup"]' );
    var $saveAllButton = $consentForm.find( '[data-g-fn="allow-all"]' );
    var $singleCatConsentTriggers = Utils.$functionElems.filter( '[data-fn~="data-processing-cat-consent-trigger"]' );
    
    // get categories, read cookie, set checkboxes according to cookie value
    
    var options = $consentForm.getOptionsFromAttr();
    var bannerOptions = $consentBanner.getOptionsFromAttr();
    
    // initial get cookie
    var consentCookieStr = Utils.CookieHandler.getCookie( options.cookieName );
    
    // initial consent status
    if ( consentCookieStr ) {
        consentStatus = $.extend( {}, defaultConsentStatus, JSON.parse( consentCookieStr ) );
    }
    else {
        consentStatus = $.extend( {}, defaultConsentStatus );
        renewCookie = true;
    }
    
    var $categoryIputs = $consentForm.find( options.categoryInputSelector );
    var categories = [];
    $categoryIputs.each( function() {
        var currentCategory = $( this ).attr( 'value' );
        categories.push( currentCategory );
        
        // add to consent object
        var currentCatFound = false;
        for ( var i = 0; i < consentStatus.cats.length; i++ ) {
            if ( consentStatus.cats[ i ].name == currentCategory ) {
                currentCatFound = true;
                
                if ( consentStatus.cats[ i ].cons == 1 ) {
                    // set checked
                    $( this ).prop( 'checked', true );

                    // initial set each single category button status
                    setCatConsentTriggers( currentCategory, true );
                }
            }
        }
        if ( ! currentCatFound ) {
            // add new category to cookie, show hint
            consentStatus.cats.push( { name: currentCategory, cons: 0 } );
            showConsentHint = true;
        }
    } );
    
    
    // do update only if changed to keep max age
    
    if ( renewCookie ) {
        // initial cookie update
        Utils.CookieHandler.setCookie( options.cookieName, JSON.stringify( consentStatus ), 365, '/' );
    }
    
    
    // bind allow all button (before bind form submit)
    $saveAllButton.on( 'click', function( event ) {
        
        event.preventDefault();
        
        $categoryIputs.each( function() {
            $( this ).prop( 'checked', true );
        } );
        
        $consentForm.trigger( 'submit' );
    } );


    // allow single category button (e.g. load Google map(s) on click on map containing element)
    $singleCatConsentTriggers.each( function() {

        var $singleCatConsentTrigger = $( this );
    
        var triggerOptions = $singleCatConsentTrigger.getOptionsFromAttr();
        var currentCategory = triggerOptions.cat || null;
    
        $singleCatConsentTrigger.on( 'click', function( event ) {
            
            event.preventDefault();

            $categoryIputs.filter( '[value="' + currentCategory + '"]' ).prop( 'checked', true );
            
            $consentForm.trigger( 'submit' );
        } );

    } );
    
    
    // bind form sumbit
    $consentForm.submit( function( event ) {
        event.preventDefault();
        $categoryIputs.each( function() {

            var currentCategory = $( this ).attr( 'value' );
            var currentConsent = $( this ).is( ':checked' );

            // console.log( '$categoryIputs.each: ' + currentCategory );
            
            // update consent object
            for ( var i = 0; i < consentStatus.cats.length; i++ ) {
                if ( consentStatus.cats[ i ].name == currentCategory ) {
                    consentStatus.cats[ i ].cons = ( currentConsent ) ? 1 : 0;
                }
            }

            // set each single category button status
            setCatConsentTriggers( currentCategory, currentConsent );

        } );
        
        
        // if changes 
        var consentCookieStr = Utils.CookieHandler.getCookie( options.cookieName );
        
        
        if ( JSON.stringify( consentStatus ) != consentCookieStr ) {
            
            // remember consent status before update cookie
            var beforeChangeConsentStatus = JSON.parse( consentCookieStr );
            
            // user interactes cookie update
            Utils.CookieHandler.setCookie( options.cookieName, JSON.stringify( consentStatus ), 365, '/' );
        
        
            for ( var i = 0; i < consentStatus.cats.length; i++ ) {
                // if anything denied which was allowed before do reload
                if ( consentStatus.cats[ i ].cons == 0 && ( beforeChangeConsentStatus.cats[ i ] !== undefined && beforeChangeConsentStatus.cats[ i ].cons == 1 ) ) {
                    
                    // do reload
                    location.reload();
                    
                    break;
                }
                
                // if anything allowed which was dynied before do apply
                if ( consentStatus.cats[ i ].cons == 1 && ( ( beforeChangeConsentStatus.cats[ i ] !== undefined && beforeChangeConsentStatus.cats[ i ].cons == 0 ) || beforeChangeConsentStatus.cats[ i ] === undefined ) ) {
                    
                    // use function for following tasks
                    applyCategory( consentStatus.cats[ i ].name );
                }
            }
                    
        }
        else {
            // no changes, do nothing
        }
        
    } );


    // set cat consent triggers to current state
    function setCatConsentTriggers( currentCategory, currentConsent ) {

        var $currentCatTriggers = $singleCatConsentTriggers.filter( '[data-fn-options*="cat: \'' + currentCategory + '\'"]' );

        $currentCatTriggers.each( function( index, elem ) {

            // console.log( '$currentCatTriggers.each: ' + index );

            var $currentCatTrigger = $( this );
        
            var triggerOptions = $currentCatTrigger.getOptionsFromAttr();
            var consentClass = triggerOptions.consentClass || '';
            var nonConsentClass = triggerOptions.nonConsentClass || '';

            var $classTarget = ( triggerOptions.classTarget ) ? $currentCatTrigger.closest( triggerOptions.classTarget ) : $currentCatTrigger;

            // console.log( 'consentClass: ' + consentClass );

            if ( consentClass ) {

                if ( currentConsent ) {
                    $classTarget.addClass( consentClass );
                }
                else {
                    $classTarget.removeClass( consentClass );
                }
            }

            if ( nonConsentClass ) {
                if ( currentConsent ) {
                    $classTarget.removeClass( nonConsentClass );
                }
                else {
                    $classTarget.addClass( nonConsentClass );
                }
            }

        } );

    }
        
    // initial apply of script content if consent given via cookie
    for ( var i = 0; i < consentStatus.cats.length; i++ ) {
        
        if ( consentStatus.cats[ i ].cons == 1 ) {
            
            // apply contents
            applyCategory( consentStatus.cats[ i ].name );
            
        }
        
    }
    
    // manage popup display
    if ( showConsentHint ) {

        // set cookie value to make visible (in case popup will be inited later)
        Utils.CookieHandler.setCookie( bannerOptions.cookieName, 0, bannerOptions.cookieExpiresDays, '/' );
        
        // wait for CookieRelatedElem to be inited
        window.setTimeout( function() {
            $consentBanner.trigger( 'CookieRelatedElem.open' );
        } );
    }
    
    // button to show popup manually
    var $showConsentBannerButton = Utils.$functionElems.filter( '[data-fn="data-processing-popup-trigger"]' );
    
    $showConsentBannerButton.on( 'click', function() {
        $consentBanner.trigger( 'CookieRelatedElem.open' );
    } );
    
    
    // functions
    
    function applyCategory( category ) {
        
        // find related templates
        var $relatedContents = Utils.$targetElems.filter( '[data-tg="data-processing-consent-content"][data-category="' + category + '"]' );
        
        // activate related templates
        $relatedContents.each( function() {
            var $elem = $( this );

            if ( typeof $elem.attr( 'data-script-src' ) !== 'undefined' ) {
                appendSrcScript( $elem.attr( 'data-script-src' ) );
            }
            else if ( typeof $elem.attr( 'data-script-content' ) !== 'undefined' ) {
                // console.log( 'append inline script \n' + decodeURIComponent( $elem.attr( 'data-script-content' ) ) )
                appendInlineScript( decodeURIComponent( $elem.attr( 'data-script-content' ) ) );
            }
            else if ( typeof $elem.attr( 'data-html' ) !== 'undefined' ) {
                // console.log( 'append html \n' + decodeURIComponent( $elem.attr( 'data-html' ) ) )
                appendHtml( $elem, decodeURIComponent( $elem.attr( 'data-html' ) ) );
            }
        } );
        
    }
    
    function appendSrcScript( src, appendTo ) {
        var currentAppendTo = ( !! appendTo ) ? appendTo : 'body';
        var script = document.createElement( 'script' );
        script.setAttribute( 'src', src );
        document[ currentAppendTo ].appendChild( script );
    }
    
    function appendInlineScript( textContent, appendTo ) {
        var currentAppendTo = ( !! appendTo ) ? appendTo : 'body';
        var script = document.createElement( 'script' );
        script.textContent = textContent;
        document[ currentAppendTo ].appendChild( script );
    }
    
    function appendHtml( elem, htmlContent ) {
        $( elem ).after( htmlContent );
    }
    
} )( jQuery, BSX_UTILS );



// CUSTOM INIT EVENT

( function( $, Utils ) {

    Utils.$window.trigger( Utils.events.initJs );

} )( jQuery, BSX_UTILS );

