(function() {
    Handlebars.templates = Handlebars.templates || {};

    var templates = document.querySelectorAll(
        'script[type="text/x-handlebars-template"]'
    );

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });

    var myHtml;
    var myOtherHtml;

    var nextUrl;
    var timeout;

    $(".submit-btn").on("click", function() {
        var userInput = $('input[name="user-input"]').val();
        var dropdownInput = $(".artist-or-album").val();
        var baseUrl = "https://elegant-croissant.glitch.me/spotify";
        myHtml = "";
        nextUrl = undefined;

        apiRequest(userInput, dropdownInput, baseUrl);
    });

    $(".more").on("click", function() {
        var userInput = $('input[name="user-input"]').val();
        var dropdownInput = $(".artist-or-album").val();
        apiRequest(userInput, dropdownInput, nextUrl);
    });

    function apiRequest(input, selection, url) {
        $.ajax({
            url: url,
            data: {
                query: input,
                type: selection
            },
            success: function(payload) {
                console.log("payload:", payload);

                payload = payload.artists || payload.albums;
                payload.input = input;

                // no results or less than 20
                if (payload.items.length < 20) {
                    $(".more").css({
                        visibility: "hidden"
                    });
                }

                //check if infinite scroll is included in url

                if (payload.next != null) {
                    nextUrl = payload.next.replace(
                        "https://api.spotify.com/v1/search",
                        "https://elegant-croissant.glitch.me/spotify"
                    );
                }
                loadResults(payload);

                if (
                    location.search.indexOf("scroll=infinite") >= 0 &&
                    payload.items.length > 0
                ) {
                    checkScrollPosition();
                } else if (payload.items.length > 0 && payload.next != null) {
                    $(".more").css({
                        visibility: "visible"
                    });
                }
            }
        });
    }
    function checkScrollPosition() {
        var windowHeight = $(window).height();
        var pageHeight = $(document).height();
        var scrollTop = $(document).scrollTop();

        var hasReachedBottom = scrollTop + windowHeight >= pageHeight - 200;
        if (hasReachedBottom) {
            // get more results!
            clearTimeout(timeout);
            console.log("TIME TO GET MORE RESULTS!!");
            var userInput = $('input[name="user-input"]').val();
            var dropdownInput = $(".artist-or-album").val();
            apiRequest(userInput, dropdownInput, nextUrl);
        } else {
            console.log("did not reach bottom yet....");
            timeout = setTimeout(checkScrollPosition, 300);
        }
    }

    function loadResults(payload) {
        myHtml += Handlebars.templates.results(payload);
        myOtherHtml = Handlebars.templates.resultsOrNot(payload);

        $(".results-container").html(myHtml);
        $(".resultsOrNot").html(myOtherHtml);
    }
})();
