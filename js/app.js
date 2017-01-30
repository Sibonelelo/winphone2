// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires' token

var app = angular.module('starter', ['ionic'])

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
	
			setTimeout(getTheToken, 1000);
			function getTheToken() {
				FCMPlugin.getToken(
					function (token) {
						if (token == null) {
							console.log("null token");
							setTimeout(getTheToken, 1000);
						} else {
							window.localStorage.setItem("token",token);
							console.log("I got the token: " + token);
						}
					},
					function (err) {
						console.log('error retrieving token: ' + err);
					}
				);
			}
			
			FCMPlugin.onTokenRefresh(function(token){
				window.localStorage.setItem("token",token);
			});
			
			FCMPlugin.onNotification(function(data){
				if(data.wasTapped){
				  //Notification was received on device tray and tapped by the user.
				  alert( JSON.stringify(data) );
				}else{
				  //Notification was received in foreground. Maybe the user needs to be notified.
				  alert( JSON.stringify(data) );
				}
			});
	
  });
  
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    templateUrl: 'home.html'
  })
  .state('menu', {
    url: '/menu',
    templateUrl: 'menu.html'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'login.html'
  })
  .state('liveMatch', {
    url: '/liveMatch',
    templateUrl: 'liveMatch.html'
  })
  .state('tournament', {
    url: '/tournament',
    templateUrl: 'tournament.html'
  })
  .state('channelS', {
    url: '/channelS',
    templateUrl: 'channelS.html'
  })
  .state('prediction', {
    url: '/prediction',
    templateUrl: 'prediction.html'
  })
  .state('settings', {
    url: '/settings',
    templateUrl: 'settings.html'
  })
  .state('points', {
    url: '/points',
    templateUrl: 'points.html'
  })
  .state('admin', {
    url: '/admin',
    templateUrl: 'admin.html'
  })
  .state('fans', {
    url: '/fans',
    templateUrl: 'fans.html'
  });
  $urlRouterProvider.otherwise('/');  
});


app.controller('MainCtrl', function($scope) {

});

app.controller('articleCtrl', function($scope, $http, $ionicScrollDelegate) {
	var teamListsSuccess = function(response){
		$scope.teamListRespo = response.data;
	};
	
	var noRespo = function(response){
		
	};
	
	$scope.checkLogedUser = function(){
		$scope.user = window.localStorage.getItem("username");
		if($scope.user){
			jQuery(function($){
			if ($('#logeduser').is(":hidden")){
				$("#login_div").slideUp('slow');
				$("#logeduser").slideDown('slow');
			}
			});
		}
		if($scope.user == "Admin"){
			jQuery(function($){
			if ($('#admin').is(":hidden")){
					$("#admin").slideDown('slow');
				}
			});
		}else{
			$("#admin").slideUp('slow');
		}
		$http.get("http://channeldiski.com/database/teamListCorner.php?list=list")
			.then(teamListsSuccess, onError);
	};
		
	
	var mainArticleSeccess = function(response){
		var top_stoty = response.data.split("~");
		$scope.date = top_stoty[0];
		$scope.title = top_stoty[1];
		$scope.story = top_stoty[2];
		$scope.image = top_stoty[3];
		$scope.no_comments = top_stoty[4];
		$scope.hits = top_stoty[5];
		$scope.like = top_stoty[6];
		$scope.artid = top_stoty[7];
		scrollToTop();
		$scope.$broadcast('scroll.infiniteScrollComplete');
		jQuery(function($){
			if ($('#bodyDiv').is(":hidden")){
				$("#loadDiv").hide('slow');
				$("#bodyDiv").show('slow');
			}
		});
		notification();
	};
	
	var onError = function(reason){
		$scope.error = "Please turn on internet connection!";
		alert($scope.error)
		jQuery(function($){
			if ($('#signInLoading').is(":hidden")){
				$("#signInLoading").slideDown('slow');
			}else{
				$("#signInLoading").slideUp('slow');
			}
		});
	};
	
	//pull for new main article-------------------------------------------------------------loadMore
	$scope.loadMain = function(){
		var user = window.localStorage.getItem("username");
		if(user){
			$http.get("http://channeldiski.com/database/server.php?main=main&username="+user)
			.then(mainArticleSeccess, onError);
			
			var token = window.localStorage.getItem("token");
			if(user=='Merit'){
				alert(token)
			}
			if(token){
				$http.get("http://channeldiski.com/database/fcm.php?token="+token+"&username="+$scope.user)
				   .then(noRespo, onError);
			}
		}else{
			$http.get("http://channeldiski.com/database/server.php?main=main")
			.then(mainArticleSeccess, onError);
		}
	};
	
	var likeSeccess = function(response){
		$scope.like = response.data;
	};
	
	//likes function------------------------------------------------------------------------
	$scope.likes = function(){
		$http.get("http://channeldiski.com/database/server.php?id="+$scope.artid)
	     .then(likeSeccess, onError);
	};
	
	var moreArticle = function(response){
		$scope.articleLists = response.data;
		$scope.$broadcast('scroll.infiniteScrollComplete');
	};
	
	var onListError = function(reason){
		$scope.error = "could not find data";
	};
	
	//get previous articles------------------------------------------------------------------
	var limit = 0;
	$scope.loadMore = function(){
		limit += 5;
		$http.get("http://channeldiski.com/database/more_articles.php?more="+limit)
	      .then(moreArticle, onListError);
	};
	
	//selected article function--------------------------------------------------------------
	$scope.articleSearch = function(articleId){
		$http.get("http://channeldiski.com/database/server.php?art_search="+articleId)
			.then(mainArticleSeccess, onError);
		

		jQuery(function($){
			if ($('#comments_div').is(":hidden")){
				$("#comments_div").slideUp('slow');
			}else{
				$("#comments_div").slideUp('slow');
			}
			$scope.commentsRespo = "";
		});
	};
	
	var commentSeccess = function(response){
		$scope.commentsRespo = response.data;
	};
	
	//commentSubmit function------------------------------------------------------------------------
	$scope.commentSubmit = function(content){
		var $contentId = $('#contentId');
		var user = window.localStorage.getItem("username");
		if(user){
			$http.get("http://channeldiski.com/database/comments.php?id="+$scope.artid+"&content="+content+"&user="+user)
				.then(commentSeccess, onError);
		}
		else{
			alert('Please login first')
		}
		$contentId.val("")
		
	};
	
	$scope.comment_function = function(){
		$http.get("http://channeldiski.com/database/comments.php?latest="+$scope.artid)
	      .then(commentSeccess, onError);
		jQuery(function($){
			if ($('#comments_div').is(":hidden")){
				$("#comments_div").slideDown('slow');
			}else{
				$("#comments_div").slideUp('slow');
			}
		});
	};
	
	scrollToTop = function(){
		$ionicScrollDelegate.scrollTop();
	};
	
	//logout function------------------------------------------------------------------------
	$scope.logout = function(){
		window.localStorage.removeItem("username");
		jQuery(function($){
			if ($('#login_div').is(":hidden")){
				$("#logeduser").slideUp('slow');
				$("#login_div").slideDown('slow');
			}
		});
	};
	
	var signUpSeccess = function(response){
		var signUpRespo = response.data.split("~");
		$scope.user = signUpRespo[0];
		$scope.team = signUpRespo[1];
		if($scope.user=="taken"){
			alert("username or phone number already exist")
			if ($('#signInLoading').is(":hidden")){
				$("#signInLoading").slideDown('slow');
			}else{
				$("#signInLoading").slideUp('slow');
			}
		}
		else{
			window.localStorage.setItem("username",$scope.user);
			window.localStorage.setItem("team",$scope.team);
			$scope.user = window.localStorage.getItem("username");
			jQuery(function($){
				if ($('#logeduser').is(":hidden")){
					$("#signUp_div").slideUp('slow');
					$("#signInLoading").slideUp('slow');
					$("#logeduser").slideDown('slow');
				}
			});
		}
	};
	
	//sign up function------------------------------------------------------------------------
	$scope.signUpSubmit = function(username_,phone,team,passwrd,conPasswrd,hints,hintReply){
		if(team == undefined){
			alert("Please select a team")
		}
		else if(hints == undefined){
			alert("Please select password hint")
		}
		else if(!(passwrd == conPasswrd)){
			alert("Passwords are not the same")
		}
		else{
			jQuery(function($){
				if ($('#signInLoading').is(":hidden")){
					$("#signInLoading").slideDown('slow');
				}
			});
			$http.get("http://channeldiski.com/database/signUp.php?username_="+username_+"&phone="+phone+"&team="+team+"&passwrd="+passwrd+"&hint="+hints+"&hintReply="+hintReply+"&onapp=yes")
				.then(signUpSeccess, onError);
		}
		
	};
	
	
	
	var signInSeccess = function(response){
		var signUpRespo = response.data.split("~");
		$scope.user = signUpRespo[0];
		$scope.team = signUpRespo[1];
		if($scope.user=="fail"){
			alert("username name and password does not match")
			if ($('#signInLoading').is(":hidden")){
				$("#signInLoading").slideDown('slow');
			}else{
				$("#signInLoading").slideUp('slow');
			}
		}
		else{
			window.localStorage.setItem("username",$scope.user);
			window.localStorage.setItem("team",$scope.team);
			$scope.user = window.localStorage.getItem("username");
			notification();
			if($scope.user == "Admin"){
				jQuery(function($){
				if ($('#admin').is(":hidden")){
						$("#admin").slideDown('slow');
					}
				});
			}else{
				$("#admin").slideUp('slow');
			}
			jQuery(function($){
				if ($('#logeduser').is(":hidden")){
					$("#login_div").slideUp('slow');
					$("#signInLoading").slideUp('slow');
					$("#logeduser").slideDown('slow');
				}
			});
		}
	};
	
	//sign In function------------------------------------------------------------------------
	$scope.signInSubmit = function(loginUsername,loginPass){
		jQuery(function($){
			if ($('#signInLoading').is(":hidden")){
				$("#signInLoading").slideDown('slow');
			}
		});
		$http.get("http://channeldiski.com/database/signIn.php?username="+loginUsername+"&passwrd="+loginPass+"&onapp=yes")
			.then(signInSeccess, onError);
	};
	
	$scope.signUp = function(){
		jQuery(function($){
			if ($('#signUp_div').is(":hidden")){
				$("#login_div").slideUp('slow');
				$("#signUp_div").slideDown('slow');
			}
		});
	};
	
	var liveMatchSeccess = function(response){
		jQuery(function($){
			if ($('#liveMatchListsLoadings').is(":hidden")){
				$("#liveMatchListsLoadings").slideUp('slow');
			}else{
				$("#liveMatchListsLoadings").slideUp('slow');
			}
		});
		$scope.liveMatchRespo = response.data;
	};
	
	//live Match function------------------------------------------------------------------------
	$scope.liveMatch = function(){
	$http.get("http://channeldiski.com/database/liveMatch.php?liveMatch=liveMatch")
		.then(liveMatchSeccess);
	};
	
	var activeMatchSeccess = function(response){
		$scope.activeMatchRespo = response.data;
		jQuery(function($){
			if ($('#loadActiveMatch').is(":hidden")){
				
			}else{
				$("#loadActiveMatch").slideUp('slow');
			}
		});
	};
	
	
	//active Match function------------------------------------------------------------------------
	$scope.getActiveMatch = function(liveMatchId){
		window.localStorage.setItem("liveMatchId",liveMatchId);
	$http.get("http://channeldiski.com/database/activeMatch.php?id="+liveMatchId)
		.then(activeMatchSeccess, onError);
		jQuery(function($){
			if ($('#activeLiveMatch').is(":hidden")){
				$("#liveMatchLists").slideUp('slow');
				$("#activeLiveMatch").slideDown('slow');
			}
		});
		loadLiveMatchUserComments();
	};
	
	//refresh commentary function------------------------------------------------------------------------
	$scope.loadnewCommentary = function(){
		var liveMatchId = window.localStorage.getItem("liveMatchId")
		$http.get("http://channeldiski.com/database/activeMatch.php?id="+liveMatchId)
			.then(activeMatchSeccess, onError);
	};
	
	//close commentary function------------------------------------------------------------------------
	$scope.closeCommentary = function(){
		$scope.activeMatchRespo = "";
		window.localStorage.removeItem("liveMatchId");
		jQuery(function($){
			if ($('#liveMatchLists').is(":hidden")){
				$("#activeLiveMatch").slideUp('slow');
				$("#loadActiveMatch").slideDown('slow');
				$("#liveMatchLists").slideDown('slow');
			}
		});
	};
	
	$scope.tournamentBack = function(tournament){
		$scope.tournamentRespo ="";
		$scope.resultsRespo = "";
		$scope.scoresRespo = "";
		if ($('#tournamentLists').is(":hidden")){
			$("#tournamentDiv").slideUp('slow');
			$("#loadtournament").slideDown('slow');
			$("#tournamentLists").slideDown('slow');
		}
	};
	
	var tournamentSeccess = function(response){
		$scope.tournamentRespo = response.data;
		jQuery(function($){
			if ($('#loadtournament').is(":hidden")){
			}else{
				$("#loadtournament").slideUp('slow');
			}
		});
	};
	var resultsSeccess = function(response){
		$scope.resultsRespo = response.data;
	};
	
	var scoresSeccess = function(response){
		$scope.scoresRespo = response.data;
	};
	
	$scope.fixtureDiv = function(){
		jQuery(function($){
			if ($('#fixture').is(":hidden")){
				$("#results").slideUp('slow');
				$("#scorers").slideUp('slow');
				$("#fixture").slideDown('slow');
			}
		});
	};
	
	$scope.reultsDiv = function(){
		jQuery(function($){
			if ($('#results').is(":hidden")){
				$("#fixture").slideUp('slow');
				$("#scorers").slideUp('slow');
				$("#results").slideDown('slow');
			}
		});
	};
	
	$scope.scorersDiv = function(){
		jQuery(function($){
			if ($('#scorers').is(":hidden")){
				$("#results").slideUp('slow');
				$("#fixture").slideUp('slow');
				$("#scorers").slideDown('slow');
			}
		});
	};
	
	//get tornament fixture function------------------------------------------------------------------------
	$scope.tournamentFunction = function(tournament){
		$http.get("http://channeldiski.com/database/tournament.php?tournament="+tournament)
			.then(tournamentSeccess, onError);
		$http.get("http://channeldiski.com/database/results.php?tournament="+tournament)
			.then(resultsSeccess, onError);
		$http.get("http://channeldiski.com/database/scorers.php?tournament="+tournament)
			.then(scoresSeccess, onError);
		jQuery(function($){
			if ($('#tournamentDiv').is(":hidden")){
				$("#tournamentLists").slideUp('slow');
				$("#tournamentDiv").slideDown('slow');
			}
		});
	};
	
	var channelSSeccess = function(response){
		jQuery(function($){
			if ($('#channelSListLoad').is(":hidden")){
			}else{
				$("#channelSListLoad").slideUp('slow');
			}
		});
		$scope.channelSRespo = response.data;
	};
	
	//load channel S function------------------------------------------------------------------------
	$scope.loadChannelS = function(){
	$http.get("http://channeldiski.com/database/channelS.php?main=main")
		.then(channelSSeccess, onError);
	};
	
	var channelSStorySeccess = function(response){
		jQuery(function($){
			if ($('#channelSStoryLoad').is(":hidden")){
			}else{
				$("#channelSStoryLoad").slideUp('slow');
			}
		});
		var channelS_stoty = response.data.split("~");
		$scope.channels_topic = channelS_stoty[0];
		$scope.channels_image = channelS_stoty[1];
		$scope.channels_summary = channelS_stoty[2];
		$scope.channels_story_date = channelS_stoty[3];
		$scope.story_by = channelS_stoty[4];
	};
	
	$scope.channelSStoryBack = function(){
		jQuery(function($){
			if ($('#news').is(":hidden")){
				$("#fullStory").slideUp('slow');
				$("#news").slideDown('slow');
				$("#channelSStoryLoad").slideDown('slow');
			}
		});
	};
	
	//load channel S story function------------------------------------------------------------------------
	$scope.loadChannelSStory = function(id){
		jQuery(function($){
			if ($('#fullStory').is(":hidden")){
				$("#news").slideUp('slow');
				$("#fullStory").slideDown('slow');
			}
		});
	$http.get("http://channeldiski.com/database/channelS.php?id="+id)
		.then(channelSStorySeccess, onError);
	};
	
	var lineUpSuccess = function(response){
		jQuery(function($){
			if ($('#loadlineUp').is(":hidden")){
			}else{
				$("#loadlineUp").slideUp('slow');
			}
		});
		$scope.lineUpRespo = response.data;
	};
	
	//load channel S news list function------------------------------------------------------------------------
	$scope.newsList = function(){
		jQuery(function($){
			if ($('#newsList').is(":hidden")){
				$("#lineUp").slideUp('slow');
				$("#loadlineUp").slideDown('slow');
				$("#newsList").slideDown('slow');
			}
		});
		$scope.lineUpRespo ="";
	};
	
	//load channel S lineUp function------------------------------------------------------------------------
	$scope.lineUp = function(){
		$http.get("http://channeldiski.com/database/lineUp.php?lineUp=lineUp")
		.then(lineUpSuccess, onError);
		jQuery(function($){
			if ($('#lineUp').is(":hidden")){
				$("#newsList").slideUp('slow');
				$("#lineUp").slideDown('slow');
			}
		});
	};
	
	var predictionSuccess = function(response){
		$scope.predictionRespo = response.data;
	};
	
	var prediction_boardSuccess = function(response){
		$scope.prediction_boardRespo = response.data;
	};
	
	//load prediction function------------------------------------------------------------------------
	$scope.prediction = function(){
		$http.get("http://channeldiski.com/database/prediction.php?prediction=prediction")
		.then(predictionSuccess, onError);
		
		$http.get("http://channeldiski.com/database/prediction_board.php?prediction_board=prediction_board")
		.then(prediction_boardSuccess, onError);
	};
	
	var predictSuccess = function(response){
		alert(response.data);
	};
	
	//predict Submit function------------------------------------------------------------------------
	$scope.predictSubmit = function(home_team,away_team,home_pred,away_pred){
		var user = window.localStorage.getItem("username");
		if(user){
			if(home_pred && away_pred){
				$http.get("http://channeldiski.com/database/predict.php?home_team="+home_team+"&away_team="+away_team+"&home_pred="+home_pred+"&away_pred="+away_pred+"&user="+user)
				 .then(predictSuccess, onError);
			}
			else{
				alert("Please select the score")
			}
		}
		else{
			alert("Please login first!")
		}
		
	};
	
	var pointsSuccess = function(response){
		jQuery(function($){
			if ($('#pointsLoad').is(":hidden")){
			}else{
				$("#pointsLoad").slideUp('slow');
			}
		});
		$scope.pointsRespo = response.data;
	};
	
	//load points function------------------------------------------------------------------------
	$scope.points = function(){
		$http.get("http://channeldiski.com/database/points.php?points=points")
		.then(pointsSuccess, onError);
	};
	
	//load profile page function------------------------------------------------------------------------
	$scope.profile = function(){
		jQuery(function($){
			if ($('#profile').is(":hidden")){
				$("#settings").slideUp('slow');
				$("#profile").slideDown('slow');
			}
		});
	};
	
	var profileSuccess = function(response){
		alert(response.data)
	};
	
	//load profile form function------------------------------------------------------------------------
	$scope.profileSubmit = function(phoneNo){
		var user = window.localStorage.getItem("username");
		if(user){
			$http.get("http://channeldiski.com/database/profile.php?phoneNo="+phoneNo+"&user="+user)
				 .then(profileSuccess, onError);
		}
		else{
			alert("Please login first")
		}
	};
	
	$scope.profileBack = function(){
		jQuery(function($){
			if ($('#settings').is(":hidden")){
				$("#profile").slideUp('slow');
				$("#settings").slideDown('slow');
			}
		});
	};
	
	var commentarySuccess = function(response){
		jQuery(function($){
			if ($('#commentaryLoad').is(":hidden")){
				$("#commentaryLoad").slideDown('slow');
			}else{
				$("#commentaryLoad").slideUp('slow');
			}
		});
		alert(response.data);
		var $status = $('#status');
		var $team = $('#team');
		var $player = $('#player');
		var $time = $('#time');
		var $comment = $('#comment');
		$status.val("")
		$team.val("")
		$player.val("")
		$time.val("")
		$comment.val("")
	};
	
	//load commentary form function------------------------------------------------------------------------
	$scope.commentarySubmit = function(){
		var live_score_id = window.localStorage.getItem("liveMatchIdCommentary");
		jQuery(function($){
			if ($('#commentaryLoad').is(":hidden")){
				$("#commentaryLoad").slideDown('slow');
			}
		});
		var $status = $('#status');
		var $team = $('#team');
		var $player = $('#player');
		var $time = $('#time');
		var $comment = $('#comment');
		$http.get("http://channeldiski.com/database/commentary.php?status="+$status.val()+"&team="+$team.val()+"&player="+$player.val()+"&time="+$time.val()+"&comment="+$comment.val()+"&live_score_id="+live_score_id)
			.then(commentarySuccess, onError);
	};
	
	//active Match Commentary function------------------------------------------------------------------------
	$scope.getActiveMatchSetId = function(liveMatchIdCommentary){
		window.localStorage.setItem("liveMatchIdCommentary",liveMatchIdCommentary);
		jQuery(function($){
			if ($('#commentaryForm').is(":hidden")){
				$("#liveMatchListsCommentary").slideUp('slow');
				$("#commentaryForm").slideDown('slow');
			}
		});
	};
	
	var activeMatchCommentarySuccess = function(response){
		$scope.liveMatchCommentaryRespo = response.data;
	};
	
	//load active match for commentary form function------------------------------------------------------------------------
	$scope.getActiveMatchCommentary = function(){
		$http.get("http://channeldiski.com/database/liveMatch.php?liveMatch=liveMatch")
			.then(activeMatchCommentarySuccess, onError);
	};
	
	var startSuccess = function(response){
		alert(response.data);
		jQuery(function($){
			if ($('#commentaryLoad').is(":hidden")){
				$("#commentaryLoad").slideDown('slow');
			}else{
				$("#commentaryLoad").slideUp('slow');
			}
		});
	};
	
	//gameStatus function------------------------------------------------------------------------
	$scope.gameStatus = function(status){
		jQuery(function($){
			if ($('#commentaryLoad').is(":hidden")){
				$("#commentaryLoad").slideDown('slow');
			}
		});
		var live_score_id = window.localStorage.getItem("liveMatchIdCommentary");
		$http.get("http://channeldiski.com/database/commentary.php?gameStatus="+status+"&live_score_id="+live_score_id)
			.then(startSuccess, onError);
	};
	
	var teamListCornerSuccess = function(response){
		jQuery(function($){
		if ($('#teamFansListsLoad').is(":hidden")){
			}
			else{
				$("#teamFansListsLoad").slideUp('slow');
			}
		});
		$scope.teamListCornerRespo = response.data;
	};
	
	//team lists function------------------------------------------------------------------------
	$scope.teamListCorner = function(){
			$http.get("http://channeldiski.com/database/teamListCorner.php?list=list")
			   .then(teamListCornerSuccess, onError);
	};
	
	var teamSuccess = function(response){
		$scope.teamPostsRespo = response.data;
	};
	
	//team Fan Open Chat function------------------------------------------------------------------------
	$scope.teamFanOpenChat = function(team){
			jQuery(function($){
			if ($('#teamFansPostsOpenChat').is(":hidden")){
					$("#teamFansLists").slideUp('slow');
					$("#teamFansPostsOpenChat").slideDown('slow');
				}
			});
			$http.get("http://channeldiski.com/database/fansPosts.php?team="+team)
			   .then(teamSuccess, onError);
	};
	
	//team Fan function------------------------------------------------------------------------fansCommentsSubmit
	$scope.teamFan = function(team){
		var myteam = window.localStorage.getItem("team");
		if(myteam == team){
			jQuery(function($){
			if ($('#teamFansPosts').is(":hidden")){
					$("#teamFansLists").slideUp('slow');
					$("#teamFansPosts").slideDown('slow');
				}
			});
			$http.get("http://channeldiski.com/database/fansPosts.php?team="+team)
			   .then(teamSuccess, onError);
		}
		else{
			alert("Access is denied to teams you do not support")
		}
	};
	
	var fanCommentsSuccess = function(response){
		$scope.fanCommentsRespo = response.data;
	};
	
	//Fan post function------------------------------------------------------------------------
	$scope.fansPost = function(id){
			jQuery(function($){
			if ($('#fansPosts').is(":hidden")){
					$("#teamFansPosts").slideUp('slow');
					$("#teamFansPostsOpenChat").slideUp('slow');
					$("#fansPosts").slideDown('slow');
				}
			});
			$http.get("http://channeldiski.com/database/fanComments.php?fans_corner_id="+id)
			   .then(fanCommentsSuccess, onError);
	};
	
	//team team FansPosts Open Chat Back function------------------------------------------------------------------------
	$scope.teamFansPostsOpenChatBack = function(){
			jQuery(function($){
			if ($('#teamFansLists').is(":hidden")){
					$("#teamFansPostsOpenChat").slideUp('slow');
					$("#teamFansLists").slideDown('slow');
				}
			});
	};
	
	//team Fans PostsBack function------------------------------------------------------------------------
	$scope.teamFansPostsBack = function(){
		$scope.teamPostsRespo = "";
			jQuery(function($){
			if ($('#teamFansLists').is(":hidden")){
					$("#teamFansPosts").slideUp('slow');
					$("#teamFansLists").slideDown('slow');
				}
			});
	};
	
	//fans Posts Back function------------------------------------------------------------------------
	$scope.fansPostsBack = function(){
		$scope.fanCommentsRespo = "";
			jQuery(function($){
			if ($('#teamFansPosts').is(":hidden")){
					$("#fansPosts").slideUp('slow');
					$("#teamFansPosts").slideDown('slow');
				}
			});
	};
	
	//fans posts form function------------------------------------------------------------------------
	$scope.fansPostsOpenChatSubmit = function(){
		var $fansPostOpenChat = $('#fansPostOpenChat');
		var myteam = 'openChat';
		var user = window.localStorage.getItem("username");
		if(user){
			$http.get("http://channeldiski.com/database/fanInsertPost.php?team="+myteam+"&post="+$fansPostOpenChat.val()+"&user="+user)
				.then(teamSuccess, onError);
		}
		else{
			alert('Please login first')
		}
		$fansPostOpenChat.val("")
		
	};
	
	//fans posts form function------------------------------------------------------------------------
	$scope.fansPostsSubmit = function(){
		var $fansPost = $('#fansPost');
		var myteam = window.localStorage.getItem("team");
		var user = window.localStorage.getItem("username");
		if(user){
			$http.get("http://channeldiski.com/database/fanInsertPost.php?team="+myteam+"&post="+$fansPost.val()+"&user="+user)
				.then(teamSuccess, onError);
		}
		else{
			alert('Please login first')
		}
		$fansPost.val("")
		
	};
	
	//fans comments form function------------------------------------------------------------------------
	$scope.fansCommentsSubmit = function(id){
		var $fansComment = $('#fansComment');
		
		var myteam = window.localStorage.getItem("team");
		var user = window.localStorage.getItem("username");
		if(user){
			$http.get("http://channeldiski.com/database/fanInsertComments.php?id="+id+"&post="+$fansComment.val()+"&user="+user)
				.then(fanCommentsSuccess, onError);
		}
		else{
			alert('Please login first')
		}
		$fansComment.val("")
	};
	
	var notificationSuccess = function(response){
		$scope.notificationRespo = response.data;
	};
	
	//notification function------------------------------------------------------------------------
	var notification = function(){
		var user = window.localStorage.getItem("username");
		$http.get("http://channeldiski.com/database/notification.php?user="+user)
			.then(notificationSuccess, onError);
		
	};
	
	//notification Seen function------------------------------------------------------------------------
	$scope.notificationSeen = function(id){
		var user = window.localStorage.getItem("username");
		$http.get("http://channeldiski.com/database/notification.php?username="+user+"&id="+id)
			.then(notificationSuccess, onError);
		
	};
	
	$scope.fogottenPass = function(){
		jQuery(function($){
		if ($('#fogotten_pass').is(":hidden")){
				$("#login_div").slideUp('slow');
				$("#fogotten_pass").slideDown('slow');
			}
		});
	};
	
	var recoverSuccess = function(response){
		$scope.recoverRespo = response.data;
	};
	
	var replySuccess = function(response){
		$scope.replyRespo = response.data;
		if($scope.replyRespo=="Password and hint doesn't match"){
			alert($scope.replyRespo)
		}
		else{
			alert($scope.replyRespo)
			jQuery(function($){
			if ($('#login_div').is(":hidden")){
					$("#fogotten_pass").slideUp('slow');
					$("#login_div").slideDown('slow');
				}
			});
		}
	};
	
	$scope.recoverSubmit = function(resetUsername,hintdata){
		if(hintdata == undefined){
			jQuery(function($){
			if ($('#hintLabel').is(":hidden")){
					$("#hintLabel").slideDown('slow');
				}
			});
		   $http.get("http://channeldiski.com/database/forgottenPass.php?username="+resetUsername)
				.then(recoverSuccess, onError);
		}else{
			$http.get("http://channeldiski.com/database/replyHint.php?username="+resetUsername+"&hintdata="+hintdata)
				.then(replySuccess, onError);
		}
	};
	
	var addTeamSuccess = function(response){
		$scope.teamRespo = response.data;
		window.localStorage.setItem("team",$scope.teamRespo);
			alert("Successfully added")
	};
	
	//add team form function------------------------------------------------------------------------
	$scope.addTeamSubmit = function(addteam){
		var myteam = window.localStorage.getItem("team");
		var user = window.localStorage.getItem("username");
		
		if(!myteam){
		if(user){
			$http.get("http://channeldiski.com/database/addteam.php?addteam="+addteam+"&user="+user)
				.then(addTeamSuccess, onError);
		}
		else{
			alert('Please login first')
		}
		}else{
			alert('Your team is '+myteam)
		}
	};
	
	var ex_dateSuccess = function(response){
		$scope.exDateRespo = response.data;
		if($scope.exDateRespo.ex_date){
		if($scope.exDateRespo.ex_date == $scope.exDateRespo.tdate){
			jQuery(function($){
			if ($('#downloadUpdate').is(":hidden")){
					$("#loadingIndex").slideUp('slow');
					$("#bodyDiv").slideDown('slow');
					$("#downloadUpdate").slideDown('slow');
				}
				
				if ($('#bodyDiv').is(":hidden")){
					$("#loadingIndex").slideUp('slow');
					$("#bodyDiv").slideUp('slow');
				}else{
					$("#loadingIndex").slideUp('slow');
					$("#bodyDiv").slideUp('slow');
				}
			});
		}else{
			alert("New update will be available in "+$scope.exDateRespo.days+" day/s")
		}
		}
			
	};
	
	$http.get("http://channeldiski.com/database/ex_date.php?version=0.0.1")
		.then(ex_dateSuccess);
		
	var liveMatchCommentsSuccess = function(response){
		$scope.liveMatchCommentsRespo = response.data;
	};
	
	//live match user comments function------------------------------------------------------------------------
	$scope.liveMatchUserComments = function(){
		var liveScoreId = window.localStorage.getItem("liveMatchId");
		var user = window.localStorage.getItem("username");
		var $match_commetsText = $('#match_commetsText');
		if(user){
		$http.get("http://channeldiski.com/database/liveMatchComments.php?liveScoreId="+liveScoreId+"&user="+user+"&match_commetsText="+$match_commetsText.val())
			.then(liveMatchCommentsSuccess, onError);
		}
		else{
			alert('Please login first')
		}
		$match_commetsText.val("")
	};
	
	//live match user comments function------------------------------------------------------------------------
	var loadLiveMatchUserComments = function(){
		var liveScoreId = window.localStorage.getItem("liveMatchId");
		$http.get("http://channeldiski.com/database/loadLiveMatchComments.php?liveScoreId="+liveScoreId)
			.then(liveMatchCommentsSuccess, onError);
	};
	
	var liveMatchEditorSuccess = function(response){
		jQuery(function($){
			if ($('#liveMatchEditCommentary').is(":hidden")){
					$("#commentaryForm").slideUp('slow');
					$("#liveMatchEditCommentary").slideDown('slow');
				}
			});
		$scope.commentaryEditRespo = response.data;
	};
	
	//live Match Editor function------------------------------------------------------------------------
	$scope.liveMatchEditor = function(sechByTime){
		var live_score_id = window.localStorage.getItem("liveMatchIdCommentary");
		$http.get("http://channeldiski.com/database/commentaryEdit.php?live_score_id="+live_score_id+"&time="+sechByTime)
			.then(liveMatchEditorSuccess, onError);
	};
	
	var getActiveMatchEditIdSuccess = function(response){
		jQuery(function($){
			if ($('#liveMatchEditForm').is(":hidden")){
					$("#liveMatchEditCommentary").slideUp('slow');
					$("#liveMatchEditForm").slideDown('slow');
				}
			});
		$scope.getActiveMatchEditIdRespo = response.data;
		var $statusE = $('#statusE');
		var $teamE = $('#teamE');
		var $playerE = $('#playerE');
		var $timeE = $('#timeE');
		var $commentE = $('#commentE');
		$teamE.val($scope.getActiveMatchEditIdRespo[0].team);
		$statusE.val($scope.getActiveMatchEditIdRespo[0].status);
		$playerE.val($scope.getActiveMatchEditIdRespo[0].player);
		$timeE.val($scope.getActiveMatchEditIdRespo[0].time);
		$commentE.val($scope.getActiveMatchEditIdRespo[0].comments);
	};
	
	//live Match Editor Form function------------------------------------------------------------------------
	$scope.getActiveMatchEditId = function(id){
		window.localStorage.setItem("editMatchId",id);
		$http.get("http://channeldiski.com/database/commentaryEdit.php?id="+id)
			.then(getActiveMatchEditIdSuccess, onError);
	};
	
	var liveMatchEditorFormSuccess = function(response){
		alert(response.data);
		jQuery(function($){
		if ($('#commentaryForm').is(":hidden")){
				$("#liveMatchEditForm").slideUp('slow');
				$("#commentaryForm").slideDown('slow');
			}
		});
	};
	
	//get Active Match Edit Id function------------------------------------------------------------------------
	$scope.liveMatchEditorForm = function(editMatchId){
		var editMatchId = window.localStorage.getItem("editMatchId");
		var $statusE = $('#statusE');
		var $teamE = $('#teamE');
		var $playerE = $('#playerE');
		var $timeE = $('#timeE');
		var $commentE = $('#commentE');
		
		$http.get("http://channeldiski.com/database/commentaryEdit.php?editMatchId="+editMatchId+"&statusE="+$statusE.val()+"&teamE="+$teamE.val()+"&playerE="+$playerE.val()+"&timeE="+$timeE.val()+"&commentE="+$commentE.val())
			.then(liveMatchEditorFormSuccess, onError);
	};
	
	var liveMatchEditorScoreSuccess = function(response){
		alert(response.data);
		jQuery(function($){
		if ($('#commentaryForm').is(":hidden")){
				$("#liveMatchEditCommentary").slideUp('slow');
				$("#commentaryForm").slideDown('slow');
			}
		});
	};
	
	//live Match Editor Score function------------------------------------------------------------------------
	$scope.liveMatchEditorScore = function(){
		var live_score_edit = window.localStorage.getItem("liveMatchIdCommentary");
		var $homescore = $('#homescore');
		var $awayscore = $('#awayscore');
		
		$http.get("http://channeldiski.com/database/commentaryEdit.php?live_score_edit="+live_score_edit+"&homescore="+$homescore.val()+"&awayscore="+$awayscore.val())
			.then(liveMatchEditorScoreSuccess, onError);
	};
	
	//liveMatch Edit Commentary Back function------------------------------------------------------------------------
	$scope.liveMatchEditCommentaryBack = function(){
			jQuery(function($){
			if ($('#commentaryForm').is(":hidden")){
					$("#liveMatchEditCommentary").slideUp('slow');
					$("#commentaryForm").slideDown('slow');
				}
			});
	};
	
});

//log controller------------------------------------------------------------------------------------liveMatchEditorForm
app.controller('logCtrl', function($scope, $http) {	 
	var log = function(response){
		$scope.logData = response.data;
	};
	
	var onError = function(reason){
		$scope.error = "could not find data";
	};
	
	$scope.getLog = function(){
	$http.get("http://channeldiski.com/database/log.php?log=log")
	     .then(log, onError);
		jQuery(function($){
			if ($('#logStanding').is(":hidden")){
				$("#logStanding").slideDown('slow');
			}else{
				$("#logStanding").slideUp('slow');
			}
		});
	};
});