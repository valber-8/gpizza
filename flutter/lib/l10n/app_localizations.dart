import 'package:flutter/material.dart';

class AppLocalizations {
  const AppLocalizations(this.locale);
  final Locale locale;

  static AppLocalizations of(BuildContext context) =>
      Localizations.of<AppLocalizations>(context, AppLocalizations) ??
      const AppLocalizations(Locale('en'));

  static const delegate = _Delegate();
  static const supportedLocales = [Locale('en'), Locale('sv')];

  bool get _sv => locale.languageCode == 'sv';

  // ── Navigation ──────────────────────────────────────────────────────────────
  String get navHome     => _sv ? 'Hem'          : 'Home';
  String get navMenu     => _sv ? 'Meny'         : 'Menu';
  String get navCart     => _sv ? 'Varukorg'     : 'Cart';
  String get navLoyalty  => _sv ? 'Lojalitet'    : 'Loyalty';
  String get navReviews  => _sv ? 'Recensioner'  : 'Reviews';

  // ── Common ───────────────────────────────────────────────────────────────────
  String get tryAgain    => _sv ? 'Försök igen'      : 'Try again';
  String get cancel      => _sv ? 'Avbryt'           : 'Cancel';
  String get remove      => _sv ? 'Ta bort'          : 'Remove';
  String get subtotal    => _sv ? 'Delsumma'         : 'Subtotal';
  String get discount    => _sv ? 'Rabatt'           : 'Discount';
  String get total       => _sv ? 'Totalt'           : 'Total';
  String get seeMenu     => _sv ? 'Se meny'          : 'See menu';
  String get search      => _sv ? 'Sök'              : 'Search';
  String get phone       => _sv ? 'Telefon'          : 'Phone';
  String get enterPhone  => _sv ? 'Ange ditt telefonnummer' : 'Enter your phone';
  String get enterName   => _sv ? 'Ange ditt namn'   : 'Enter your name';
  String get viewCart    => _sv ? 'Visa varukorg'    : 'View cart';

  // ── Home ─────────────────────────────────────────────────────────────────────
  String get open             => _sv ? 'Öppet'               : 'Open';
  String get closed           => _sv ? 'Stängt'              : 'Closed';
  String get quickAccess      => _sv ? 'Snabbåtkomst'        : 'Quick access';
  String get heroTitle        => _sv ? 'Hantverkspizzor'     : 'Artisan pizzas';
  String deliveryTime(String min) =>
      _sv ? 'Leverans inom $min min' : 'Delivery in up to $min min';
  String get trackOrder       => _sv ? 'Spåra beställning'       : 'Track order';
  String get orderNumber      => _sv ? 'Beställningsnummer'      : 'Order number';
  String get orderNumberHint  => 'Ex: ORD-20240101-001';
  String get enterOrderNumber => _sv
      ? 'Ange beställningsnummer'
      : 'Enter the order number';

  // ── Menu ─────────────────────────────────────────────────────────────────────
  String get menuTitle        => _sv ? 'Meny'                              : 'Menu';
  String get noItemsAvailable => _sv ? 'Inga artiklar tillgängliga just nu' : 'No items available at the moment';

  // ── Cart ─────────────────────────────────────────────────────────────────────
  String get cartTitle        => _sv ? 'Varukorg'                                    : 'Cart';
  String get cartEmpty        => _sv ? 'Din varukorg är tom'                          : 'Your cart is empty';
  String get cartEmptySubtitle=> _sv ? 'Lägg till artiklar från menyn för att börja' : 'Add items from the menu to get started';
  String get clear            => _sv ? 'Rensa'                                        : 'Clear';
  String get clearCart        => _sv ? 'Rensa varukorg'                               : 'Clear cart';
  String get clearCartConfirm => _sv
      ? 'Ta bort alla artiklar från varukorgen?'
      : 'Remove all items from the cart?';
  String get couponLabel      => _sv ? 'Rabattkupong'   : 'Discount coupon';
  String get couponHint       => _sv ? 'Kupongkod'      : 'Coupon code';
  String get apply            => _sv ? 'Tillämpa'       : 'Apply';
  String couponApplied(String code) =>
      _sv ? 'Kupong "$code" tillämpad' : 'Coupon "$code" applied';
  String get couponSuccess    => _sv ? 'Kupong tillämpad!'          : 'Coupon applied successfully!';
  String get couponError      => _sv ? 'Fel vid tillämpning av kupong' : 'Error applying coupon';
  String get goToCheckout     => _sv ? 'Gå till kassan'             : 'Go to checkout';

  // ── Checkout ─────────────────────────────────────────────────────────────────
  String get checkoutTitle    => 'Checkout';
  String get yourDetails      => _sv ? 'Dina uppgifter'           : 'Your details';
  String get nameRequired     => _sv ? 'Namn *'                   : 'Name *';
  String get phoneRequired    => _sv ? 'Telefon *'                : 'Phone *';
  String get phonePlaceholder => '(11) 99999-9999';
  String get orderTypeLabel   => _sv ? 'Beställningstyp'          : 'Order type';
  String get delivery         => _sv ? 'Leverans'                 : 'Delivery';
  String get pickup           => _sv ? 'Upphämtning'              : 'Pickup';
  String get deliveryAddress  => _sv ? 'Leveransadress *'         : 'Delivery address *';
  String get deliveryAddressHint => _sv ? 'Gata, nummer, stadsdel'    : 'Street, number, neighborhood';
  String get enterDeliveryAddress => _sv
      ? 'Ange leveransadress'
      : 'Enter the delivery address';
  String get notes            => _sv ? 'Anteckningar (valfritt)'  : 'Notes (optional)';
  String get notesHint        => _sv ? 'T.ex. ingen lök, fylld kant' : 'E.g. no onion, stuffed crust';
  String get orderSummary     => _sv ? 'Ordersammanfattning'      : 'Order summary';
  String get confirmOrder     => _sv ? 'Bekräfta beställning'     : 'Confirm Order';
  String get orderError       => _sv ? 'Fel vid beställning'      : 'Error placing order';

  // ── Order Confirmation ───────────────────────────────────────────────────────
  String get orderConfirmed   => _sv ? 'Beställning bekräftad!'  : 'Order confirmed!';
  String get orderReceivedMsg => _sv
      ? 'Din beställning har mottagits och behandlas'
      : 'Your order has been received and is being processed';
  String get orderLabel       => _sv ? 'Beställning'              : 'Order';
  String get estimatedTime    => _sv ? 'Beräknad tid'             : 'Estimated time';
  String minutesSuffix(String min) => _sv ? '$min minuter' : '$min minutes';
  String get orderTotal       => _sv ? 'Beställningstotal'        : 'Order total';
  String pointsEarned(int pts)=> _sv ? '+$pts poäng' : '+$pts points';
  String get pointsAddedMsg   => _sv
      ? 'Tillagda till ditt lojalitetskonto'
      : 'Added to your loyalty account';
  String get trackOrderBtn    => _sv ? 'Spåra beställning'        : 'Track Order';
  String get backToMenu       => _sv ? 'Tillbaka till menyn'      : 'Back to menu';

  // ── Order Tracking ────────────────────────────────────────────────────────────
  String get trackOrderTitle      => _sv ? 'Spåra beställning'                    : 'Track Order';
  String get orderCancelled       => _sv ? 'Beställning avbokad'                  : 'Order Cancelled';
  String get orderItemsTitle      => _sv ? 'Beställningsartiklar'                 : 'Order items';
  String get deliveryAddressLabel => _sv ? 'Leveransadress'                       : 'Delivery address';
  String get autoUpdate           => _sv
      ? 'Uppdateras automatiskt var 30:e sekund'
      : 'Updates automatically every 30 seconds';
  String get loadOrderError       => _sv ? 'Fel vid laddning av beställning'      : 'Error loading order';

  // ── Status stepper labels ─────────────────────────────────────────────────────
  String get statusReceived       => _sv ? 'Mottagen'    : 'Received';
  String get statusPreparing      => _sv ? 'Förbereder'  : 'Preparing';
  String get statusBaking         => _sv ? 'I ugnen'     : 'In oven';
  String get statusReady          => _sv ? 'Klar'        : 'Ready';
  String get statusOutForDelivery => _sv ? 'På väg'      : 'On the way';
  String get statusCompleted      => _sv ? 'Levererad'   : 'Delivered';
  Map<String, String> get statusLabels => {
    'received':         statusReceived,
    'preparing':        statusPreparing,
    'baking':           statusBaking,
    'ready':            statusReady,
    'out_for_delivery': statusOutForDelivery,
    'completed':        statusCompleted,
  };

  // ── Loyalty ───────────────────────────────────────────────────────────────────
  String get loyaltyTitle     => _sv ? 'Lojalitetsprogram'        : 'Loyalty Program';
  String get checkPoints      => _sv ? 'Kontrollera poäng'        : 'Check points';
  String get check            => _sv ? 'Kontrollera'              : 'Check';
  String get checkPointsError => _sv ? 'Fel vid kontroll av poäng': 'Error checking points';
  String get pointsLabel      => _sv ? 'poäng'                    : 'points';
  String pointsUntilNext(int pts) => _sv
      ? '$pts poäng till nästa rabatt'
      : '$pts points until next discount';
  String get rewardLimit      => _sv
      ? 'Du har nått inlösningsgränsen!'
      : 'You\'ve reached the redemption limit!';
  String get howItWorks       => _sv ? 'Hur det fungerar'         : 'How it works';
  String get loyaltyRule1     => _sv
      ? 'Tjäna 1 poäng för varje R\$1,00 spenderat på beställningar'
      : 'Earn 1 point for every R\$1.00 spent on orders';
  String get loyaltyRule2     => _sv
      ? 'För varje 100 poäng, få R\$5,00 rabatt'
      : 'Every 100 points, get R\$5.00 off';
  String get loyaltyRule3     => _sv
      ? 'Dina poäng är kopplade till ditt registrerade telefonnummer'
      : 'Your points are linked to your registered phone number';

  // ── Reviews ───────────────────────────────────────────────────────────────────
  String get reviewsTitle     => _sv ? 'Recensioner'                         : 'Reviews';
  String get noReviews        => _sv ? 'Inga recensioner ännu'               : 'No reviews yet';
  String get beFirstToReview  => _sv ? 'Var den första att recensera!'       : 'Be the first to review!';
  String get writeReview      => _sv ? 'Skriv en recension'                  : 'Write a review';
  String get loadReviewsError => _sv ? 'Fel vid laddning av recensioner'     : 'Error loading reviews';
  String get yourName         => _sv ? 'Ditt namn *'                         : 'Your name *';
  String get yourRating       => _sv ? 'Ditt betyg'                          : 'Your rating';
  String get commentLabel     => _sv ? 'Kommentar'                           : 'Comment';
  String get commentHint      => _sv ? 'Berätta om din upplevelse...'        : 'Tell us about your experience...';
  String get submitReview     => _sv ? 'Skicka recension'                    : 'Submit review';
  String get reviewSubmitted  => _sv
      ? 'Recension skickad! Den visas efter godkännande.'
      : 'Review submitted! It will be displayed after approval.';
  String get reviewError      => _sv ? 'Fel vid skickande av recension'      : 'Error submitting review';

  // ── Item detail ───────────────────────────────────────────────────────────────
  String get addToCart        => _sv ? 'Lägg i varukorg' : 'Add to cart';
  String addedToCartMsg(String name, int qty) {
    final unit = _sv
        ? (qty > 1 ? '$qty artiklar' : '1 artikel')
        : (qty > 1 ? '$qty items' : '1 item');
    return _sv
        ? '$name ($unit) tillagd i varukorgen'
        : '$name ($unit) added to cart';
  }
}

class _Delegate extends LocalizationsDelegate<AppLocalizations> {
  const _Delegate();

  @override
  bool isSupported(Locale locale) => AppLocalizations.supportedLocales
      .any((l) => l.languageCode == locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async =>
      AppLocalizations(locale);

  @override
  bool shouldReload(_Delegate old) => false;
}
