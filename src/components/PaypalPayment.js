import {loadScript} from "@paypal/paypal-js";
import {useEffect} from "react";
import {CreateOrderPaypal, onApprovePaypal} from "./Payment";

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
                                const orderID = await CreateOrderPaypal({
                                    curso: 10,
                                });
                                return orderID;
                            },
                            async onApprove(data, actions) {
                                const details = await onApprovePaypal(
                                    data.orderID
                                );
                                console.log(
                                    "onApprove. returned value:: ",
                                    details
                                );
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
            <div id="paypal-div"></div>
        </div>
    );
}
