<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha256-k2WSCIexGzOj3Euiig+TlR8gA0EmPjuc79OEeY5L45g=" crossorigin="anonymous"></script>
</head>
<body>
<div id="fb-root"></div>

<div><?php echo 'hello world'; ?></div>

<h3>Join us</h3>

<fb:login-button
        scope="public_profile,email,user_photos"
        onlogin="checkLoginState();">
</fb:login-button>

<button class="login-trigger">Se connecter</button>

<script>
    jQuery('.login-trigger').on('click', function(event) {
        FB.login(function() {

        }, {scope: 'public_profile,email,user_photos'});
    });
</script>

<script>
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '1150571488410466',
            cookie     : true,
            xfbml      : true,
            version    : 'v2.10'
        });

        FB.AppEvents.logPageView();

        // popup connexion -> FB.login()

        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
            //console.log(response)
        });
    };

    function checkLoginState() {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    }

    function statusChangeCallback(response) {
        console.log('response before ------');
        console.log(response);
        console.log('response after ------');
    }

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
</script>

<br><hr><br>

<div class="fb-like" data-href="https://aqueous-depths-10964.herokuapp.com/" data-width="100" data-layout="box_count" data-action="like" data-size="large" data-show-faces="true" data-share="true"></div>

<h2>Add a wonderful comment</h2>

<div class="fb-comments" data-href="https://aqueous-depths-10964.herokuapp.com/" data-width="600" data-numposts="5"></div>
</body>
</html>