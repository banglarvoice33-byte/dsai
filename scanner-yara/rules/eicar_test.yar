/*
 * DSAI harmless EICAR test-string detector for repeatable CI verification.
 */
rule DSAI_EICAR_Test_Signature
{
    strings:
        $eicar = "EICAR-STANDARD-ANTIVIRUS-TEST-FILE" ascii
    condition:
        $eicar
}
