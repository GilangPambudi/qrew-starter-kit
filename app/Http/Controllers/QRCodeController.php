<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class QRCodeController extends Controller
{
    public function index()
    {
        //layoutnya bisa temen-temen sesuaiin sama kebutuhannya temen-temen
        return view('qr');
    }

    public function submit(Request $request)
    {
        $this->validate($request, [
            'link' => 'required|url',
        ]);
        
        $code = time();

        $qr = QrCode::format('svg')->generate($request->link);
        $qrImageName = $code . '.svg';

        // simpan ke local storage
        Storage::disk('public')->put('qr/' . $qrImageName, $qr);

        //layoutnya bisa temen-temen sesuaiin sama kebutuhannya temen-temen
        return view('scanner', compact('code'));
    }
}