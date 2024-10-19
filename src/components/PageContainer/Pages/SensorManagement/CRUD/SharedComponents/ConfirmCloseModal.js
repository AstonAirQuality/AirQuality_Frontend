import {VscClose} from "react-icons/vsc"

const ConfirmCloseModal = ({setMenuOpen,setModalOpen, setChanges}) => {
    
    function handleClose(e){
        if(e.target.id === "Confirm-modal"){
            setModalOpen(false)
        }
    }

   
    return(
        <div id = "Confirm-modal" onClick={handleClose} className="modal-container">
            <div className="modal">
                <div className="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
                    <h1 className="text-xl font-semibold text-gray-500 dark:text-gray-400">You have unsaved changes</h1>           
                    <button onClick={() => setModalOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" >
                        <VscClose size={32}/>
                    </button>
                </div>

                <div className="p-2">
                <h5 className="text-m font-semibold text-gray-500 dark:text-gray-400">Are you sure you want to exit?</h5>
                </div>

                <div className="flex items-center justify-between">
                    <button onClick={() => {setMenuOpen(false); setModalOpen(false);setChanges(false)}} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                        Yes
                    </button>

                    <button onClick={() => setModalOpen(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                        Cancel
                    </button> 
                </div>
            </div>
        </div>
    )
    
}


export default ConfirmCloseModal