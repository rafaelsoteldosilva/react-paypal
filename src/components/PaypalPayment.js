import {loadScript} from "@paypal/paypal-js";
import {useEffect} from "react";
import moment from "moment";
import "moment/locale/es";

function resultMessage(message) {
    const container = document.querySelector("#result-message");
    container.innerHTML = message;
}

export function PaypalPayment() {
    useEffect(() => {
        let paypal;
        async function InicializePaypal() {
            try {
                paypal = await loadScript({clientId: "test"});
            } catch (error) {
                console.error("failed to load the PayPal JS SDK script", error);
            }

            if (paypal) {
                try {
                    await paypal
                        .Buttons({
                            async createOrder() {
                                console.log("createOrder");
                                try {
                                    const response = await fetch(
                                        "http://127.0.0.1:8000/api/v1/paypalorder",
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                cart: [
                                                    {
                                                        sku: "0001",
                                                        quantity: "1",
                                                    },
                                                ],
                                            }),
                                        }
                                    );

                                    const orderData = await response.json();
                                    console.log(
                                        "createOrder:: orderData:: ",
                                        orderData
                                    );

                                    if (orderData?.id) {
                                        return orderData.id;
                                    } else {
                                        const errorDetail =
                                            orderData?.details?.[0];
                                        const errorMessage = errorDetail
                                            ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                            : JSON.stringify(orderData);

                                        throw new Error(errorMessage);
                                    }
                                } catch (error) {
                                    console.error("createOrder:: ", error);
                                }
                            },
                            async onApprove(data, actions) {
                                console.log("onAprove, data:: ", data);
                                try {
                                    console.log(
                                        "onApprove:: going to http.../capture"
                                    );
                                    const response = await fetch(
                                        `http://127.0.0.1:8000/api/v1/capture`,
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                orderID: data.orderID,
                                            }),
                                        }
                                    );
                                    const orderData = await response.json();
                                    console.log(
                                        "onApprove:: orderData:: ",
                                        orderData
                                    );
                                    if (orderData?.status === "COMPLETED") {
                                        const transaction =
                                            orderData?.purchase_units?.[0]
                                                ?.payments?.captures?.[0] ||
                                            orderData?.purchase_units?.[0]
                                                ?.payments?.authorizations?.[0];
                                        console.log(
                                            "onApprove:: transaction:: ",
                                            transaction
                                        );
                                        const logoutMessageStr = `Transation ID: ${transaction.id}<br>Date: ${moment(transaction.update_time).format("MMMM Do YYYY, h:mm:ss a")}<br>Amount: ${transaction.amount.value} ${transaction.amount.currency_code}`;
                                        resultMessage(logoutMessageStr);
                                        return orderData;
                                    } else {
                                        // Three cases to handle:
                                        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                                        //   (2) Other non-recoverable errors -> Show a failure message

                                        const errorDetail =
                                            orderData?.details?.[0];
                                        console.log(
                                            "onApprove:: errorDetail:: ",
                                            errorDetail
                                        );

                                        if (
                                            errorDetail?.issue ===
                                            "INSTRUMENT_DECLINED"
                                        ) {
                                            // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                                            // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                                            return actions.restart();
                                        } else if (errorDetail) {
                                            // (2) Other non-recoverable errors -> Show a failure message
                                            throw new Error(
                                                `${errorDetail.description} (${orderData.debug_id})`
                                            );
                                        } else if (!orderData.purchase_units) {
                                            throw new Error(
                                                JSON.stringify(orderData)
                                            );
                                        }
                                        // else {
                                        //     // Or go to another URL:  actions.redirect('thank_you.html');
                                        //     const transaction =
                                        //         orderData?.purchase_units?.[0]
                                        //             ?.payments?.captures?.[0] ||
                                        //         orderData?.purchase_units?.[0]
                                        //             ?.payments
                                        //             ?.authorizations?.[0];
                                        //     resultMessage(
                                        //         `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`
                                        //     );
                                        // }
                                    }
                                } catch (error) {
                                    console.error("onAprove:: error", error);
                                    resultMessage(
                                        `Sorry, your transaction could not be processed...<br><br>${error}`
                                    );
                                }
                            },
                            onCancel(data) {
                                // Show a cancel page, or return to cart
                                console.log("onCancel:: ", data);
                                resultMessage("Transaction cancelled");
                                // window.location.assign("/your-cancel-page");
                            },
                        })
                        .render("#paypal-div");
                } catch (error) {
                    console.error("failed to render the PayPal Buttons", error);
                }
            }
        }

        InicializePaypal();
    }, []);

    return (
        <div>
            <div id="paypal-div" />
            <div id="result-message" style={{fontWeight: "bold"}} />
        </div>
    );
}
