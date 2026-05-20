import DatePicker from "react-datepicker";
import { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale'

registerLocale('pt-BR', ptBR);

type Prop = {
    expiryDatePicker: (newDate: Date) => void;
    selectedDate: Date;
}

export function DatePickerComponent({ expiryDatePicker, selectedDate }: Prop){

    return (
        <DatePicker 
            selected={selectedDate}
            onChange={(newDate: Date | null)=> {
                if(newDate){
                    expiryDatePicker(newDate);
                }
            }}
            locale={`pt-BR`}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm placeholder:text-slate-400"
            dateFormat={`dd-MM-yyyy`}
            minDate={new Date()}
        />
    )
}