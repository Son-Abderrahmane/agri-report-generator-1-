<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateFertigationKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fertigation:migrate-keys';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrates fertilizer and target keys from elements (ca, mg, s) to oxides (cao, mgo, so3)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Migrating growth stage targets...');
        
        $targetMappings = [
            'p' => 'p2o5',
            'k' => 'k2o',
            'ca' => 'cao',
            'mg' => 'mgo',
            's' => 'so3',
        ];

        foreach ($targetMappings as $old => $new) {
            $updated = DB::table('growth_stage_targets')
                ->where('nutrient', $old)
                ->update(['nutrient' => $new]);
            $this->info("Updated {$updated} targets from {$old} to {$new}");
        }

        $this->info('Migration complete.');
        $this->warn('Note: For fertilizers, since we added new columns (cao, mgo, so3) to the frontend but the database schema might need updating, please ensure you run your Laravel migrations if you added these columns to the fertilizers table.');
        
        // If the fertilizers table has these as JSON or text columns, we'd update them. 
        // If they are dedicated columns in MySQL, the user needs to create a migration for the fertilizers table 
        // to rename `ca` to `cao`, `mg` to `mgo`, `s` to `so3`.
    }
}
