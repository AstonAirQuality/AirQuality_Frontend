import {VscClose} from "react-icons/vsc"

const ViewContainer = ({menuOpen, setMenuOpen, rowData}) => {

    function handleClose(e){
        if(e.target.id === "modal"){
            setMenuOpen(false) 
        }
    }

    if (menuOpen !== false){
        if(menuOpen.includes("View")){
            return (
            <> 
                <div id = "modal" onClick={handleClose} className="modal-container">
                    <div className="crud-container">
                        <h5 className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
                            {menuOpen}
                        </h5>
                        <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" >
                            <VscClose size={32}/>
                        </button>
                        {/* This is where the inner content of the side panel will go */}
                        <p className= "font-semibold text-gray-500 dark:text-gray-400">Not implemented</p>
                    </div>
                </div>
            </>
            )
        }
    }
}



export default ViewContainer
