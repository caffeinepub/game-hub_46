import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Types
  public type Game = {
    id : Text;
    title : Text;
    franchise : Text;
    releaseYear : Nat;
    developer : Text;
    genre : Text;
    platform : Text;
    sport : Text;
    description : Text;
    rating : Float;
    coverImage : ?Storage.ExternalBlob;
    tags : [Text];
    trending : Bool;
    isNew : Bool;
    playCount : Nat;
  };

  module Game {
    public func compare(game1 : Game, game2 : Game) : Order.Order {
      Text.compare(game1.id, game2.id);
    };
  };

  public type GameInput = {
    title : Text;
    franchise : Text;
    releaseYear : Nat;
    developer : Text;
    genre : Text;
    platform : Text;
    sport : Text;
    description : Text;
    coverImage : ?Storage.ExternalBlob;
    tags : [Text];
    trending : Bool;
    isNew : Bool;
  };

  public type UserProfile = {
    name : Text;
    favorites : Set.Set<Text>;
    recentlyPlayed : [Text];
    playCounts : Map.Map<Text, Nat>;
  };

  public type UserProfileView = {
    name : Text;
    favorites : [Text];
    recentlyPlayed : [Text];
    playCounts : [(Text, Nat)];
  };

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      Nat.compare(a.favorites.size(), b.favorites.size());
    };

    public func toView(profile : UserProfile) : UserProfileView {
      {
        name = profile.name;
        favorites = profile.favorites.toArray();
        recentlyPlayed = profile.recentlyPlayed;
        playCounts = profile.playCounts.toArray();
      };
    };
  };

  public type Comment = {
    id : Nat;
    gameId : Text;
    author : Principal;
    content : Text;
    timestamp : Int;
  };

  module Comment {
    public func compare(comment1 : Comment, comment2 : Comment) : Order.Order {
      Nat.compare(comment1.id, comment2.id);
    };
  };

  public type Rating = {
    gameId : Text;
    user : Principal;
    stars : Nat;
  };

  // State
  let accessControlState = AccessControl.initState();
  let games = Map.empty<Text, Game>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let comments = Map.empty<Nat, Comment>();
  let ratings = Map.empty<Text, Map.Map<Principal, Nat>>();

  var nextCommentId = 0;

  include MixinAuthorization(accessControlState);

  // Helper function to get or create user profile
  func getOrCreateProfile(user : Principal) : UserProfile {
    switch (userProfiles.get(user)) {
      case (?profile) { profile };
      case (null) {
        let newProfile : UserProfile = {
          name = "";
          favorites = Set.empty<Text>();
          recentlyPlayed = [];
          playCounts = Map.empty<Text, Nat>();
        };
        userProfiles.add(user, newProfile);
        newProfile;
      };
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfileView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?UserProfile.toView(profile) };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfileView {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?UserProfile.toView(profile) };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfileView) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let mutableProfile : UserProfile = {
      name = profile.name;
      favorites = Set.empty();
      recentlyPlayed = profile.recentlyPlayed;
      playCounts = Map.empty();
    };
    userProfiles.add(caller, mutableProfile);
  };

  // Game CRUD operations
  public shared ({ caller }) func createGame(input : GameInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create games");
    };

    let gameId = input.title.concat(input.releaseYear.toText());

    if (games.containsKey(gameId)) {
      Runtime.trap("Game already exists");
    };

    let newGame : Game = {
      id = gameId;
      title = input.title;
      franchise = input.franchise;
      releaseYear = input.releaseYear;
      developer = input.developer;
      genre = input.genre;
      platform = input.platform;
      sport = input.sport;
      description = input.description;
      rating = 0.0;
      coverImage = input.coverImage;
      tags = input.tags;
      trending = input.trending;
      isNew = input.isNew;
      playCount = 0;
    };

    games.add(gameId, newGame);
    gameId;
  };

  public shared ({ caller }) func updateGame(gameId : Text, input : GameInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update games");
    };

    let existing = switch (games.get(gameId)) {
      case (null) {
        Runtime.trap("Game not found");
      };
      case (?game) { game };
    };

    let updatedGame : Game = {
      existing with
      title = input.title;
      franchise = input.franchise;
      releaseYear = input.releaseYear;
      developer = input.developer;
      genre = input.genre;
      platform = input.platform;
      sport = input.sport;
      description = input.description;
      coverImage = input.coverImage;
      tags = input.tags;
      trending = input.trending;
      isNew = input.isNew;
    };

    games.add(gameId, updatedGame);
  };

  public shared ({ caller }) func deleteGame(gameId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete games");
    };

    if (not games.containsKey(gameId)) {
      Runtime.trap("Game not found");
    };

    games.remove(gameId);
  };

  public query func getGame(gameId : Text) : async Game {
    // No authorization check - accessible to all users including guests
    switch (games.get(gameId)) {
      case (null) {
        Runtime.trap("Game not found");
      };
      case (?game) { game };
    };
  };

  public query func listGames() : async [Game] {
    // No authorization check - accessible to all users including guests
    games.values().toArray().sort();
  };

  // Favorites Management
  public shared ({ caller }) func updateFavorites(gameId : Text, add : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update favorites");
    };

    let profile = getOrCreateProfile(caller);

    if (add) {
      profile.favorites.add(gameId);
    } else {
      profile.favorites.remove(gameId);
    };
  };

  // Play Game Tracking
  public shared ({ caller }) func playGame(gameId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play games");
    };

    // Update user profile
    let profile = getOrCreateProfile(caller);

    let currentCount = switch (profile.playCounts.get(gameId)) {
      case (null) { 0 };
      case (?count) { count };
    };
    profile.playCounts.add(gameId, currentCount + 1);

    // Update game play count
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) {
        let updatedGame = {
          game with
          playCount = game.playCount + 1;
        };
        games.add(gameId, updatedGame);
      };
    };
  };

  // Rating System
  public shared ({ caller }) func rateGame(gameId : Text, stars : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rate games");
    };

    if (stars < 1 or stars > 5) {
      Runtime.trap("Rating must be between 1 and 5 stars");
    };

    if (not games.containsKey(gameId)) {
      Runtime.trap("Game not found");
    };

    // Get or create ratings map for this game
    let gameRatings = switch (ratings.get(gameId)) {
      case (null) {
        let newMap = Map.empty<Principal, Nat>();
        ratings.add(gameId, newMap);
        newMap;
      };
      case (?existingMap) { existingMap };
    };

    // Add or update user's rating
    gameRatings.add(caller, stars);

    // Calculate average rating
    var total : Float = 0.0;
    var count : Float = 0.0;
    for ((_, rating) in gameRatings.entries()) {
      total += rating.toFloat();
      count += 1.0;
    };

    let avgRating = if (count > 0.0) { total / count } else { 0.0 };

    // Update game with new average rating
    switch (games.get(gameId)) {
      case (null) { };
      case (?game) {
        let updatedGame = {
          game with
          rating = avgRating;
        };
        games.add(gameId, updatedGame);
      };
    };
  };

  public query func getGameRating(gameId : Text) : async Float {
    // No authorization check - accessible to all users including guests
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) { game.rating };
    };
  };

  // Comments Management
  public shared ({ caller }) func addComment(gameId : Text, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    if (not games.containsKey(gameId)) {
      Runtime.trap("Game not found");
    };

    let newComment : Comment = {
      id = nextCommentId;
      gameId = gameId;
      author = caller;
      content = content;
      timestamp = Time.now();
    };
    comments.add(nextCommentId, newComment);
    nextCommentId += 1;
    nextCommentId - 1;
  };

  public shared ({ caller }) func updateComment(commentId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update comments");
    };

    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?existing) {
        if (existing.author != caller) {
          Runtime.trap("Unauthorized: Cannot update another user's comment");
        };

        let updatedComment = {
          existing with
          content = content;
          timestamp = Time.now();
        };

        comments.add(commentId, updatedComment);
      };
    };
  };

  public shared ({ caller }) func deleteComment(commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };

    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        // Allow comment author or admin to delete
        if (comment.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete another user's comment");
        };
        comments.remove(commentId);
      };
    };
  };

  public query func getAllComments() : async [Comment] {
    // No authorization check - accessible to all users including guests
    comments.values().toArray().sort();
  };

  public query func getGameComments(gameId : Text) : async [Comment] {
    // No authorization check - accessible to all users including guests
    let allComments = comments.values().toArray();
    allComments.filter<Comment>(func(c) { c.gameId == gameId });
  };

  // Leaderboard System
  public query func getLeaderboard(limit : Nat) : async [(Principal, Nat)] {
    // No authorization check - accessible to all users including guests
    let profiles = userProfiles.entries().toArray();

    // Calculate total play count for each user
    let userTotals = profiles.map(
      func((principal, profile)) {
        var total : Nat = 0;
        for ((_, count) in profile.playCounts.entries()) {
          total += count;
        };
        (principal, total);
      }
    );

    // Sort by play count descending
    let sorted = userTotals.sort(
      func(a, b) {
        Nat.compare(b.1, a.1);
      }
    );

    // Return top N users
    let resultSize = Nat.min(limit, sorted.size());
    Array.tabulate<(Principal, Nat)>(resultSize, func(i) { sorted[i] });
  };
};
