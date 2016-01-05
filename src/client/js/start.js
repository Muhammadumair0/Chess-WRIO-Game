import React from 'react';

function getUUID(strQuery) {
	var strSearch = strQuery.substr(1),
		strPattern = /([^=]+)=([^&]+)&?/ig,
		arrMatch = strPattern.exec(strSearch),
		objRes = {};
	while (arrMatch != null) {
		objRes[arrMatch[1]] = arrMatch[2];
		arrMatch = strPattern.exec(strSearch);
	}
	return objRes['uuid'];
};

function getLoginUrl() {
	var host = window.location.host;
	host = host.replace('chess.', 'login.');
//	return "//" + host;
//	return "http://127.0.0.1:5000";
	return "http://login.wrioos.com";
};

class Start extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			user: !1
		}
	}


	componentWillMount() {
		var that = this;
		$.ajax({
				type: "GET",
				url: "/data",
				data: {
					uuid: getUUID(window.location.search)
				}
			})
			.success(function(res) {
				that.setState({
					user: res.user,
					invite: res.invite,
					alien: res.alien,
					expired: res.expired
				});
			})
			.fail(function(err) {
				that.setState({
					user: null
				});
			});
	}

	componentDidUpdate() {
		var that = this;
		function openAuthPopup() {
			var loginUrl = getLoginUrl();
			var callbackurl = '//' + window.location.host + '/callback'
			var newWin = window.open(loginUrl + '/authapi?callback=' + encodeURIComponent(callbackurl), "Login", "height=500,width=700");
		}

		function start() {
			if (that.state.invite && that.state.invite !== "") {
				$.ajax({
					type: "POST",
					url: "/api/invite_callback",
					data: {
						user: that.state.user.titterID,
						uuid: getUUID(window.location.search),
						invite: that.state.invite
					}
				}).success(function () {
					that.state.footer = "Game started, you can return to Twitter";
					window.close();
				}).fail(function() {
					that.state.footer = "Link Expired";
				});
			} else {
				$.ajax({
					type: "POST",
					url: "/api/access_callback",
					data: {
						uuid: getUUID(window.location.search),
						user: that.state.user.titterID
					}
				}).success(function () {
					that.state.footer = "Game started, you can return to Twitter";
					window.close();
				});
			}
		}

		if (this.state.user && !this.state.expired) {
			start();
		} else if (!this.state.user) {
			openAuthPopup();
		}
	}

	render() {
		var button = this.state.invite ? "Accept" : "Start";
		var _button = this.state.invite ? "Login & Accept" : "Login & Start";
		this.state.footer = this.state.alien ? "This link is for the player @" + this.state.user.username : (this.state.expired ? "Link Expired" : "...please wait");

		function logoff() {
			$.ajax('/logoff').success(function () {
				location.reload();
			});
		}

		var style = {marginTop: '10px'};

		this.state.form = this.state.user ?
			<div>
				<h4> {this.state.user.lastName} </h4>
				<button type="button" className="btn btn-default" onClick={logoff}> Log out </button>
				<button type="button" className="btn btn-primary ok" disabled><span className="glyphicon glyphicon-ok"></span>{button}</button >
				<h4>{this.state.footer}</h4>
			</div> : 
			<div>
				<button type="button" className="btn btn-primary ok" style={style} disabled><span className = "glyphicon glyphicon-ok"></span>{_button}</button>
				<h4>{this.state.footer}</h4>
			</div>

		return (
			<div> {this.state.form} </div>
		)
	}

}

React.render( < Start / > , document.getElementById('startholder'));
