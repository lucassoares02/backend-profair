const router = require("express").Router();

const Merchandise = require("@controller/Merchandise");
const Negotiation = require("@controller/Negotiation");
const Provider = require("@controller/Provider");
const Category = require("@controller/Category");
const Request = require("@controller/Request");
const Graphs = require("@controller/Graphs");
const Client = require("@controller/Client");
const Buyer = require("@controller/Buyer");
const Notice = require("@controller/Notice");
const User = require("@controller/User");
const Multishow = require("@controller/Multishow");
const Delete = require("@controller/Delete");
const Faceline = require("@controller/Faceline");
const Wedding = require("@controller/Wedding");
const Log = require("@controller/Log");
const Notification = require("@controller/Notification");
const WindowNegotiation = require("@controller/WindowNegotiation");
const Backup = require("@controller/Backup");

router.post("/faceline-user", Faceline.insert);
router.post("/faceline-user-update", Faceline.update);

// Router with the headers
router.post("/getuser", Log.InsertLog, User.getUser);
router.post("/getusermore", Log.InsertLog, User.getUserDoubleCompany);
router.post("/getuserweb", Log.InsertLog, User.getUserWeb);

router.get("/getallusersorg", User.getAllUsersOrg);
router.get("/getallusersprovider", User.getAllUsersProvider);
router.get("/getprovideruser/:code/:type", User.getProviderUser);
router.get("/getconsultsprovider/:provider", User.getConsultsProvider);
router.get("/getusersprovidernotinlist", User.getUsersProviderNotInList);
router.get("/getallusersassociate", User.getAllUsersAssociate);
router.get("/getnegotiationwindow", User.getNegotiationWindowUser);

router.get("/allacesso", Client.allAccess);
router.get("/allclient", Client.getAllClient);
router.get("/client/:codacesso", Client.getOneClient);
router.get("/clientconsult/:codconsultor", Client.getClientConsult);

router.get("/checkcodeuser/:code", Client.checkCodeUser);
router.post("/insertperson", Client.postInsertPerson);
router.post("/insertuser", Client.postInsertUser);
router.post("/updateperson", Client.updatePerson);
router.post("/updateusers", Client.updateUsers);
router.post("/inserrelationprovider", Client.insertRelationProviderClient);

router.get("/clientmerchandise/:codmercadoria", Client.getClientMerchandise);
router.get("/clientmerchandisetrading/:codmercadoria/:codnegotiation", Client.getClientMerchandiseTrading);
router.get("/stores/:codconsultor", Client.getStoreConsultant);
router.get("/stores/:user/:consultant_id/:supplier_id", Client.getOneClientNew);
router.get("/storescategory/:codprovider", Client.getStoresCategory);
router.get("/stores", Client.getAllStores);
router.get("/storesgraph", Client.getAllStoresGraph);
router.get("/storesgraphprovider", Client.getAllProvidersGraph);

router.get("/valueminutegraph", Client.getAllStoresGraphHour);
router.get("/graphevolution", Client.getAllStoresGraphEvolution);

router.get("/valueminutegraphprovider/:codeprovider", Client.getSellGraphHourProvider);

router.get("/valuefair", Client.getValueTotalFair);

router.get("/storesbyprovider/:codprovider", Client.getStoresbyProvider);
router.get("/storespresentbyprovider/:codprovider", Client.getStoresPresentbyProvider);

router.get("/categoriesconsult/:codconsult", Category.getCategoryConsult);

router.get("/notices", Notice.getAllNotice);
router.get("/schedule", Notice.getAllSchedule);

router.get("/providerclient/:codconsultor", Provider.getProviderClient);

router.get("/suppliersinvoicing", Provider.getProviderSells);
router.post("/updatedetailsprovider", Provider.updateProviderImageAndColor);
router.get("/companies/:type", Provider.getCompanies);
router.get("/providerscategories/:codbuyer", Provider.getProvidersCategories);
router.get("/providersconsult/:codconsultclient", Provider.getProvidersClient);
router.get("/providerconsult/:codconsult", Provider.getProviderConsult);

router.get("/providerdetails/:codforn", Provider.getProviderDetails);

router.post("/insertprovider", Provider.postInsertProvider);

router.get("/negotiationprovider/:codforn", Negotiation.getNegotiationProvider);
router.get("/negotiationclient/:codclient/:codforn", Negotiation.getNegotiationClient);

router.get("/negotiationproviderclient/:codclient/:codforn", Negotiation.getNegotiationsProviderWithMerchandisePerClient);

router.get("/negotiationclientwithprice/:codclient/:codforn", Negotiation.getNegotiationClientWithPrice);
router.get("/negotiationclientwithpricenotnull/:codclient/:codforn", Negotiation.getNegotiationClientsWithPriceNotNull);

router.post("/insertnegotiation", Negotiation.PostInsertNegotiation);

router.post("/insertnegotiationrelacionamercadoria", Negotiation.PostInsertNegotiationRelacionaMercadoria);

router.get("/exportnegotiations", Negotiation.GetExportNegotiations);

router.get("/exportnegotiationsprovider/:supplier/:buyer/:negotiation", Negotiation.GetExportNegotiationsProvider);

router.get("/exportnegotiationsclient/:codeclient", Negotiation.GetExportNegotiationsClientTesteaaaaaaaaa);

router.get("/exportnegotiationsclientprovider/:codeclient/:codeprovider", Negotiation.GetExportNegotiationsClientPerProvider);
router.get("/exportnegotiationperclient/:codeclient/:codenegotiation", Negotiation.GetExportNegotiationsPerNegotiationClient);
router.get("/exportnegotiationper/:codenegotiation", Negotiation.GetExportNegotiationsPerNegotiation);
router.get("/exportnegotiationperprovider/:codeclient/:codenegotiation", Negotiation.GetExportNegotiationPerProvider);


router.get("/ExportNegotiationsPerProvider/:provider", Negotiation.ExportNegotiationsPerProvider);

router.get("/exportproductnegotiationperprovider/:provider", Negotiation.exportProductsPerNegotiationPerProvider);

router.get("/buyersclient/:codconsultorclient", Buyer.getBuyersClient);

router.get("/buyersprovider/:codprovider", Buyer.getBuyersProvider);

router.get("/buyers", Buyer.getAllBuyers);

router.get("/statusnegotiation", Negotiation.negotiationStatus);
router.get("/statusnegotiation/:code", Negotiation.changeNegotiationStatus);


router.patch("/merchandise/:codMercadoria", Merchandise.patchMerchandise);
router.get("/merchandiseclientprovidernegotiation/:codclient/:codprovider/:codnegotiation", Merchandise.getMerchandiseClientProviderNegotiation);
router.get("/merchandiseprovider/:codprovider", Merchandise.getMerchandiseProvider);
router.get("/merchandisetoptenprovider/:codprovider", Merchandise.getTopTenMerchandiseProvider);
router.get("/merchandiseproviderifclient/:codclient/:codprovider/:codnegotiation", Merchandise.getMerchandiseProviderIfClientLimitNegotiation);
router.get("/merchandiseproviderifclientlimitnegotiation/:codclient/:codprovider/:codnegotiation", Merchandise.getMerchandiseProviderIfClientLimitNegotiation);

router.get("/merchandisenegotiationprovider/:codprovider/:codnegotiation", Merchandise.getMerchandiseNegotiationProvider);
router.get("/merchandisenegotiationproviderifClient/:codprovider/:codnegotiation", Merchandise.getMerchandiseNegotiationProviderIfClient);

router.get("/merchandisepercustomer/:codclient/:codeprovider", Merchandise.getMerchandisePerCustomer);

router.get("/merchandiseperclient/:codclient/:codeprovider/:codenegotiation", Merchandise.getMerchandisePerClient);

router.post("/insertmerchandise", Merchandise.postInsertMerchandise);

router.get("/requestproviderclient/:codclient", Request.getRequestProviderClient);
router.get("/requesttopproviderclient/:codclient", Request.getRequestTopProviderClient);
router.get("/requesttonegotiationclient/:codclient/:codprovider", Request.getRequestNegotiationProviderClient);
router.get("/requesttonegotiationsperprovider/:codprovider", Request.getRequestNegotiationsPerProvider);

router.get("/requestsprovider/:codprovider", Request.getRequestsProvider);
router.get("/exportrequestsprovider/:provider", Request.ExportClientsPerProvider);


router.get("/requestsprovidernegotiation/:codenegotiation", Request.getRequestsNegotiation);

router.get("/requestsnegotiationbyclient/:codebranch", Request.getRequestsClientsWithNegotiation);
router.get("/requestsnegotiationclientororg/:client/:provider", Request.getRequestsClientsOrOrg);

router.get("/requestsclients/:codconsult", Request.getRequestsClients);
router.post("/insertrequest", Request.postInsertRequest);

router.post("/insertrequestnew", Log.InsertLog, Backup.InsertSell, Request.postInserRequestNew);

router.get("/allrequestclients", Request.getAllRequests);

router.get("/percentageclients/:codprovider", Graphs.getPercentageClients);
router.get("/percentageproviderbyclients/:codbuyer", Graphs.getPercentagePovidersByClients);
router.get("/percentageclientsorganization", Graphs.getPercentageClientsOrganization);
router.get("/percentageprovidersorganization", Graphs.getPercentageProvidersOrganization);
router.get("/totalvalueclients/:codprovider", Graphs.getTotalValueClients);
router.get("/information", Graphs.getTotalInformations);
router.get("/exportpdf/:supplier/:negotiation/:client", Graphs.getExportPdf);
router.get("/exportpdfgpt/:supplier/:negotiation/:client", Graphs.getExportPdfTesteLayoutGpt);
router.get("/exportpdfdeep/:supplier/:negotiation/:client", Graphs.getExportPdfTesteLayoutDeep);

router.get("getnegotiationmultishow/:category", Graphs.getExportPdf);

router.post("/multishow/negotiation", Multishow.getNegotiations);
router.post("/multishow/negotiation/disabled", Multishow.getNegotiationsDisabled);
router.post("/multishow/negotiation/out/adega", Multishow.getNegotiationsOutAdega);
router.get("/multishow/merchandiserefresh/:product/:negotiation", Multishow.refreshMerchandise);
router.get("/multishow/getquerypreevent", Multishow.getQueryPreEvent);
router.get("/multishow/getqueryposevent", Multishow.getQueryPosEvent);
router.get("/multishow/pre/outside", Multishow.getQueryPreOutside);
router.get("/multishow/pre/inside", Multishow.getQueryPreInside);
router.get("/multishow/pos/outside", Multishow.getQueryPosOutiside);
router.get("/multishow/pos/inside", Multishow.getQueryPosInside);

router.get("/deleteallinformations", Delete.deleteAll);
router.delete("/deletecompanytouser/:company/:user/:type", Delete.deleteCompanyToUser);
router.get("/insertcompanytouser/:company/:user/:type", Provider.insertCompanyToUser);


router.get("/wedding/get", Wedding.get);
router.get("/wedding/confirm", Wedding.confirm);
router.get("/wedding/desconfirm", Wedding.disconfirm);
router.get("/wedding/getallguests", Wedding.getAllGuests);

router.get("/getwindownegotiations/:client", WindowNegotiation.getWindowNegotiation);

router.delete("/notification/:id", Notification.deleteNotifications);
router.get("/notifications", Notification.getNotifications);
router.get("/notifications/all", Notification.getNotificationsAll);
router.post("/notification", Notification.insertNotification);
router.post("/notification/update", Notification.updateNotification);
router.post("/notification/send", Notification.sendNotification);
router.post("/notification/opened", Notification.openedNotification);
router.post("/notification/save/token", Notification.saveTokenNotification);
router.get("/notification/targets/:notification", Notification.getTargetsNotifications);
router.get("/notification/pending", Notification.getPendingNotificationPerUser);
router.get("/notification/check", Notification.checkNotificationPerUser);
router.get("/notification/:id", Notification.getNotificationDetails);


module.exports = router;