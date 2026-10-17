import Sidebar from "../components/Sidebar";

function Inventory() {

    return (

        <div className="d-flex">

            <Sidebar />

            <div className="flex-grow-1 p-4">

                <h2>Inventory Management</h2>

                <div className="card mt-4">

                    <div className="card-body">

                        <h5>Inventory Module</h5>

                        <p>
                            Product management,
                            stock management and
                            inventory reports will appear here.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Inventory;