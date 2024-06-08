//
export const CreateOrderPaypal = async (data) => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/paypalorder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error ||
                "An error occurred while creating the PayPal order."
        );
    }

    const order = await response.json();
    return order.id;
};

export const onApprovePaypal = async (orderID) => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/capture", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({orderID: orderID}),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error ||
                "An error occurred while creating the PayPal order."
        );
    }

    const details = await response.json();
    return details;
};
