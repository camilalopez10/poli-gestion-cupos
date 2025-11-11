<?php
// SimpleXLSX (minimal) - read first sheet rows as arrays
class SimpleXLSX {
    private $zip;
    private $sheets = [];
    public static function parse($filename){
        $s = new SimpleXLSX();
        $s->zip = new ZipArchive();
        if ($s->zip->open($filename) !== TRUE) return false;
        // read sharedStrings
        $shared = [];
        if(($idx = $s->zip->locateName('xl/sharedStrings.xml'))!==false){
            $data = $s->zip->getFromIndex($idx);
            $xml = new SimpleXMLElement($data);
            foreach($xml->si as $si){
                $shared[] = (string)$si->t;
            }
        }
        // read sheet1
        if(($idx = $s->zip->locateName('xl/worksheets/sheet1.xml'))!==false){
            $data = $s->zip->getFromIndex($idx);
            $xml = new SimpleXMLElement($data);
            $ns = $xml->getNamespaces(true);
            $rows = [];
            foreach($xml->sheetData->row as $r){
                $row = [];
                foreach($r->c as $c){
                    $t = (string)$c['t'];
                    $v = isset($c->v) ? (string)$c->v : '';
                    if($t=='s') $v = isset($shared[intval($v)]) ? $shared[intval($v)] : $v;
                    $row[] = $v;
                }
                $rows[] = $row;
            }
            $s->sheets[0] = $rows;
        }
        return $s;
    }
    public function rows($sheet=0){ return $this->sheets[$sheet] ?? []; }
}
?>